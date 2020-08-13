import { Plugin, normalizePath } from "docset-tools-types";
import kinds from "./kinds";
import { join } from "path";
import { TypescriptMetadata } from "./types";
const Typedoc = require("typedoc");

const plugin: Plugin = {
  execute: async function ({ createTmpFolder, include, pluginOptions }) {
    pluginOptions = { ...pluginOptions };
    const entryPoints = (pluginOptions.entryPoint || ["src/index.ts"]).map(
      normalizePath
    );
    const app = new Typedoc.Application();
    app.options.addReader(new Typedoc.TSConfigReader());
    app.options.addReader(new Typedoc.TypeDocReader());
    app.bootstrap({
      mode: "library",
      excludePrivate: true,
      moduleResolution: "node",
      target: "esnext",
      jsx: "preserve",
      experimentalDecorators: true,
      ...pluginOptions.typedocOptions,
    });

    const tempDir = await createTmpFolder();
    const rtn: any = {};
    const links: Record<string, string> = {};
    const project = app.convert(app.expandInputFiles(entryPoints));
    if (!project) {
      throw new Error(
        "Could not create typedoc project: check source paths " +
          entryPoints.join(", ")
      );
    }
    const jsonFile = join(tempDir, "typedoc.json");
    app.generateDocs(project, tempDir);
    app.generateJson(project, jsonFile);

    const iterate = ({
      data,
      moduleName,
      parent,
    }: {
      data: TypescriptMetadata;
      moduleName?: string;
      parent?: { name: string; path: string };
    }) => {
      console.log("\n\n", data);
      const kind = data.kindString;
      if (!kind && data.children) {
        // root node
        data.children.forEach((child) => {
          iterate({
            data: child,
            moduleName,
          });
        });
      } else {
        const dictValue = kinds[data.kindString];
        if (!dictValue) {
          return;
        }

        if (!rtn[dictValue.zealEntryName]) {
          rtn[dictValue.zealEntryName] = {};
        }
        let name: string;
        const dataName = data.name.replace(/^"/g, "").replace(/"$/, "");
        if (kind === "External module") {
          // special case
          name = dataName.substring(1).replace(/\/|\./g, "_");
          const url = `${dictValue.folder}/${moduleName}.html`;
          moduleName = `_${name}_`.toLocaleLowerCase();
          links[`${name}@${dictValue.zealEntryName}`] = url;
          rtn[dictValue.zealEntryName][name] = url;
        } else if (!dictValue.folder) {
          // not in a subfolder
          name = dataName;
          const url = `${dictValue.folder}/${name.toLocaleLowerCase()}.html`;
          links[`${name}@${dictValue.zealEntryName}`] = url;
          rtn[dictValue.zealEntryName][name] = url;
        } else {
          // in a subfolder
          name = dataName;
          const url = parent
            ? `${dictValue.folder}/${parent.path}.${name.toLowerCase()}.html`
            : `${dictValue.folder}/_${name.toLowerCase()}_.html`;
          links[`${name}@${dictValue.zealEntryName}`] = url;
          rtn[dictValue.zealEntryName][name] = url;
        }

        if (dictValue.doContinue && data.children) {
          data.children.forEach((child) => {
            const path = links[`${name}@${dictValue.zealEntryName}`];
            if (!path) {
              console.log(path, " - ", links);
            }
            iterate({
              data: child,
              moduleName,
              parent: {
                path,
                name,
              },
            });
          });
        }
      }
    };
    const data = require(jsonFile);
    try {
      iterate({
        data,
      });
    } catch (e) {
      console.error(e);
    }

    await include({
      path: tempDir,
      rootDirName: "typedoc",
    });

    return {
      entries: rtn,
    };
  },
};
export default plugin;

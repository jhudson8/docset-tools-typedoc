import { Plugin, normalizePath, DocsetEntryType } from "docset-tools-types";
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
      parent?: {
        name: string;
        baseUrl: string;
        docsetEntryType: DocsetEntryType;
        level: number;
        data: TypescriptMetadata;
        folder: string;
      };
    }) => {
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

        let folder = dictValue.folder;
        let name = data.name.replace(/^"/g, "").replace(/"$/, "");
        let pathName = name.replace(/\/|\./g, "_").toLowerCase();
        const useParentInfo =
          parent && !parent.data.kindString.match(/module/i);
        if (kind === "External module") {
          // special case
          pathName = pathName.substring(1);
        }

        let baseUrl = `_${pathName}_`;
        let url = `typedoc/${dictValue.folder}/${baseUrl}.html`;
        let type: DocsetEntryType =
          useParentInfo && parent
            ? parent.docsetEntryType
            : dictValue.docsetEntryType;

        if (parent) {
          if (useParentInfo) {
            name = `${parent.name}.${name}`;
            type = parent.docsetEntryType;
            folder = parent.folder;
          }

          if (!dictValue.folder) {
            folder = parent.folder;
            baseUrl = parent.baseUrl;
            if (parent.level < 2) {
              url = `typedoc/${folder}/${parent.baseUrl}.html#${pathName}`;
            } else {
              url = `typedoc/${folder}/${parent.baseUrl}#${pathName}`;
            }
          } else if (!parent.baseUrl.includes(".html")) {
            url = `typedoc/${folder}/${parent.baseUrl}.${pathName}.html`;
            baseUrl = `${parent.baseUrl}.${pathName}.html`;
          } else if (!parent.baseUrl.includes("#")) {
            url = `typedoc/${folder}/${parent.baseUrl}#${pathName}`;
            baseUrl = parent.baseUrl;
          }
        }

        if (!rtn[type]) {
          rtn[type] = {};
        }
        rtn[type][name] = url;

        if (dictValue.doContinue && data.children) {
          data.children.forEach((child) => {
            iterate({
              data: child,
              moduleName,
              parent: {
                name,
                docsetEntryType: type,
                baseUrl,
                level: parent ? parent.level + 1 : 1,
                data,
                folder,
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
      plist: {
        dashIncludeCSS: ".menu { display: none };",
      },
    };
  },
};
export default plugin;

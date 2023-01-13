import { Plugin, normalizePath, DocsetEntryType } from "docset-tools-types";
import kinds from "./kinds";
import { join } from "path";
import { TypescriptMetadata } from "./types";
import { spawn } from 'child_process';

const plugin: Plugin = {
  execute: async function ({ createTmpFolder, include, pluginOptions }) {
    pluginOptions = { ...pluginOptions };
    const tempFolder = await createTmpFolder();
    const jsonPath = join(tempFolder, 'ts-docs.json');
    const tempDir = join(tempFolder, 'ts-docs');
    const entryPoint = process.cwd() + "/src/index.ts";

    let rtn: any = {};

    await new Promise((resolve, reject) => {
      const child = spawn(process.cwd() + '/node_modules/.bin/typedoc', [entryPoint, '--json', jsonPath]);
      child.stdout.on('error', (data) => {
        console.log(`typedoc:\n${data}`);
      });
      child.on('exit', function(code){
        if (code === 0) {
          resolve(undefined);
        } else {
          reject('Error code: ' + code);
        }
      });
    });

    await new Promise((resolve, reject) => {
      const child = spawn(process.cwd() + '/node_modules/.bin/typedoc', [entryPoint, '--out', tempDir]);
      child.stdout.on('error', (data) => {
        console.log(`typedoc:\n${data}`);
      });
      child.on('exit', function(code){
        if (code === 0) {
          resolve(undefined);
        } else {
          reject('Error code: ' + code);
        }
      });
    });

    // find all of the modules that we want to show in outline view
    // find the index module of root and keep a reference to all the modules (and find their dependencies)
    const keepers: Record<
      string,
      {
        id: number;
        exportedAs?: string;
      }
    > = {};
    const iterateForDiscovery = ({
      data,
      parent,
      indexOnly,
    }: {
      data: TypescriptMetadata;
      parent?: TypescriptMetadata;
      indexOnly?: boolean;
    }) => {
      if (indexOnly) {
        // we only want the index module
        for (let i = 0; i < data.children.length; i++) {
          const child = data.children[i];
          if (child.name.match(/\"index\"/)) {
            keepers[child.id] = {
              id: child.id,
              exportedAs: "index",
            };
            // find all the exported modules
            for (let j = 0; j < child.children.length; j++) {
              const subChild = child.children[j];
              if (subChild.flags.isExported && !subChild.flags.isPrivate) {
                keepers[subChild.target || subChild.id] = {
                  id: subChild.target || subChild.id,
                  exportedAs: subChild.name,
                };
              }
            }
          }
        }
        return;
      }

      let isParentIncluded = parent ? keepers[parent.id] : undefined;
      if (isParentIncluded && isParentIncluded.exportedAs === "index") {
        // even though this is included and all submodules from the code above
        // we want to reuse the "not included" logic for this special case
        isParentIncluded = undefined;
      }
      if (data.children) {
        // we want anything except index (because we already got that)
        const shouldChildrenBeIncluded = keepers[data.id] || isParentIncluded;
        for (let i = 0; i < data.children.length; i++) {
          const child = data.children[i];
          if (shouldChildrenBeIncluded) {
            keepers[child.id] =
              keepers[child.id] || child.flags.isExported
                ? { id: child.id }
                : undefined;
          }
          iterateForDiscovery({ data: child, parent: data });
        }
      }
    };

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
      } else if (kind === 'Project' && data.children) {
        data.children.forEach((child: TypescriptMetadata) => {
          iterate({
            data: child
          });
        });
      } else {
        const dictValue = kinds[data.kindString];
        if (!dictValue) {
          return;
        }

        const isKeeper = keepers[data.id];
        let folder = dictValue.folder;
        let name = data.name.replace(/^"/g, "").replace(/"$/, "");
        if (isKeeper && isKeeper.exportedAs) {
          name = isKeeper.exportedAs;
        }
        let pathName = name.replace(/[\/|\.-]/g, "_").toLowerCase();
        name = name.replace(/^_/, "").replace(/_$/, "");
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
            if (folder === "modules" && parent.baseUrl === "_index_") {
              // special case
              url = `typedoc/${folder}/_${pathName}_.html`;
              baseUrl = `_${pathName}_.html`;
              parent.level = parent.level - 1;
            }
            url = `typedoc/${folder}/${parent.baseUrl}.${pathName}.html`;
            baseUrl = `${parent.baseUrl}.${pathName}.html`;
          } else if (!parent.baseUrl.includes("#")) {
            url = `typedoc/${folder}/${parent.baseUrl}#${pathName}`;
            baseUrl = parent.baseUrl;
          }
        }

        if (!data.target) {
          if (!rtn[type]) {
            rtn[type] = {};
          }
          rtn[type][name] = url;
        }

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

    const data = require(jsonPath);

    try {
      iterateForDiscovery({ data, indexOnly: true });
      iterateForDiscovery({ data });
      iterate({
        data,
      });
    } catch (e) {
      console.error(e);
    }

    await include({
      path: tempDir,
      rootDirName: "typedoc",
      appendToBottom: {
        "assets/css/main.css": `
          .col-menu { display: none !important; }
          .col-content { width: 100% !important; }
        `,
      },
    });

    // FIXME need to figure out the new structure to create valid nav entries
    rtn = {
      [DocsetEntryType.Section]: {
        ['Typescript Docs']: 'typedoc/index.html'
      }
    };

    return {
      entries: rtn,
    };
  },
};
export default plugin;

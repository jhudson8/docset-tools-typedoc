export interface TypescriptMetadata {
  id: number;
  name: string;
  kindString: string;
  children?: TypescriptMetadata[];
  flags: {
    isExported?: boolean;
  };
  target: number;
}

export interface TypescriptMetadata {
  id: number;
  name: string;
  kindString: string;
  children?: TypescriptMetadata[];
  flags: {
    isExported?: boolean;
    isPrivate?: boolean;
  };
  target: number;
}

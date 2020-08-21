import { DocsetEntryType } from "docset-tools-types";

export interface KindValue {
  folder?: string;
  doContinue: boolean;
  docsetEntryType: DocsetEntryType;
}

const kinds: Record<string, KindValue> = {
  Global: {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Section,
  },
  "External Module": {
    folder: "modules",
    doContinue: true,
    docsetEntryType: DocsetEntryType.Module,
  },
  Module: {
    folder: "modules",
    doContinue: true,
    docsetEntryType: DocsetEntryType.Module,
  },
  Reference: {
    folder: "modules",
    doContinue: true,
    docsetEntryType: DocsetEntryType.Module,
  },
  Enum: {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Enum,
  },
  "Enum member": {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Enum,
  },
  Variable: {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Variable,
  },
  Function: {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Function,
  },
  Class: {
    folder: "classes",
    doContinue: true,
    docsetEntryType: DocsetEntryType.Class,
  },
  Interface: {
    folder: "interfaces",
    doContinue: true,
    docsetEntryType: DocsetEntryType.Interface,
  },
  Constructor: {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Constructor,
  },
  Property: {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Property,
  },
  Method: {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Method,
  },
  "Call signature": {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Section,
  },
  "Index signature": {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Section,
  },
  "Constructor signature": {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Section,
  },
  Parameter: {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Parameter,
  },
  "Type literal": {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Type,
  },
  "Type parameter": {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Type,
  },
  Accessor: {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Section,
  },
  "Get signature": {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Section,
  },
  "Set signature": {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Section,
  },
  "Object literal": {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Variable,
  },
  "Type alias": {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Type,
  },
  Event: {
    doContinue: false,
    docsetEntryType: DocsetEntryType.Event,
  },
};
export default kinds;

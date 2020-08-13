import { DocsetEntryType } from "docset-tools-types";

export interface KindValue {
  folder?: string;
  doContinue: boolean;
  zealEntryName: DocsetEntryType;
}

const kinds: Record<string, KindValue> = {
  Global: {
    doContinue: false,
    zealEntryName: DocsetEntryType.Section,
  },
  "External Module": {
    folder: "modules",
    doContinue: true,
    zealEntryName: DocsetEntryType.Module,
  },
  Module: {
    folder: "modules",
    doContinue: true,
    zealEntryName: DocsetEntryType.Module,
  },
  Reference: {
    folder: "modules",
    doContinue: true,
    zealEntryName: DocsetEntryType.Module,
  },
  Enum: {
    doContinue: false,
    zealEntryName: DocsetEntryType.Enum,
  },
  "Enum member": {
    doContinue: false,
    zealEntryName: DocsetEntryType.Enum,
  },
  Variable: {
    doContinue: false,
    zealEntryName: DocsetEntryType.Variable,
  },
  Function: {
    doContinue: false,
    zealEntryName: DocsetEntryType.Function,
  },
  Class: {
    folder: "classes",
    doContinue: true,
    zealEntryName: DocsetEntryType.Class,
  },
  Interface: {
    folder: "interfaces",
    doContinue: true,
    zealEntryName: DocsetEntryType.Interface,
  },
  Constructor: {
    doContinue: false,
    zealEntryName: DocsetEntryType.Constructor,
  },
  Property: {
    doContinue: false,
    zealEntryName: DocsetEntryType.Property,
  },
  Method: {
    doContinue: false,
    zealEntryName: DocsetEntryType.Method,
  },
  "Call signature": {
    doContinue: false,
    zealEntryName: DocsetEntryType.Section,
  },
  "Index signature": {
    doContinue: false,
    zealEntryName: DocsetEntryType.Section,
  },
  "Constructor signature": {
    doContinue: false,
    zealEntryName: DocsetEntryType.Section,
  },
  Parameter: {
    doContinue: false,
    zealEntryName: DocsetEntryType.Parameter,
  },
  "Type literal": {
    doContinue: false,
    zealEntryName: DocsetEntryType.Type,
  },
  "Type parameter": {
    doContinue: false,
    zealEntryName: DocsetEntryType.Type,
  },
  Accessor: {
    doContinue: false,
    zealEntryName: DocsetEntryType.Section,
  },
  "Get signature": {
    doContinue: false,
    zealEntryName: DocsetEntryType.Section,
  },
  "Set signature": {
    doContinue: false,
    zealEntryName: DocsetEntryType.Section,
  },
  "Object literal": {
    doContinue: false,
    zealEntryName: DocsetEntryType.Object,
  },
  "Type alias": {
    doContinue: false,
    zealEntryName: DocsetEntryType.Section,
  },
  Event: {
    doContinue: false,
    zealEntryName: DocsetEntryType.Event,
  },
};
export default kinds;

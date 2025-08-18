import type { AttributeSpecType, NodeSpecType } from "domlib";

////////////////////////////////////////////////////////////////////////////////

export interface ICNodeDSLComponentNode{
  get name()                         : string;
  get __brand_ICNodeDSLComponentNode(): true;
}

export function isICNodeDSLComponentNode( o: any ): o is ICNodeDSLComponentNode {
  if(!(o && o instanceof Object )) return false;
  return !!o.__brand_ICNodeDSLComponentNode;
}

export type AbstractComponentStubParamsType = {name: string};

////////////////////////////////////////////////////////////////////////////////

export type CNodeNodeSpecType = NodeSpecType | ICNodeDSLComponentNode | CNodeSpecType;
export type CNodeSpecType =
    [string, AttributeSpecType, ... CNodeNodeSpecType[]]
  | [string, ... CNodeNodeSpecType[]]
  | Element

import { Feature, fMixinTools, type IFeatureClass } from "qoop";
import type { AbstractCNode } from "../components";
import { isElementNode } from "domlib";
import type { CNodeManager } from "./CNodeManager";
import type { Constructor } from "@looper-utils/types";

export interface INodeManager {
  getComponent( n: Node ): AbstractCNode;
  getNode( c: AbstractCNode ): Node;
  bindComponent( c: AbstractCNode, n: Node): void;
  unbindComponent( c: AbstractCNode ): void;
}

export class NodeManager extends Feature(){

  static applyFeature(Base: Constructor<CNodeManager>){
    const {d} = fMixinTools(NodeManager as IFeatureClass);
    return class extends Base{
      override readonly getComponent    = d('getComponent')    as ( n: Node ) => AbstractCNode;
      override readonly getNode         = d('getNode')         as ( c: AbstractCNode ) => Node;
      override readonly bindComponent   = d('bindComponent')   as ( c: AbstractCNode, n: Node) => void;
      override readonly unbindComponent = d('unbindComponent') as ( c: AbstractCNode ) => void;

      constructor(... args: any[]){
        super(... args);
        new NodeManager().inject(this);
      }
    }
  }

  private _d2c : WeakMap<Node, AbstractCNode> = new WeakMap();
  private _c2d : WeakMap<AbstractCNode, Node> = new WeakMap();
  getComponent( n: Node ):AbstractCNode | null { return this._d2c.get(n) || null; }
  getNode( c: AbstractCNode ):Node | null { return this._c2d.get(c) || null; }
  bindComponent( c: AbstractCNode, n: Node ){
    if( this._c2d.has(c) || this._d2c.has(n) ) throw new Error();
    if( isElementNode(n) ) n.setAttribute('data-cnode-id', c.id);
    this._c2d.set( c, n );
    this._d2c.set( n, c );
  }

  unbindComponent( c: AbstractCNode ) {
    if( !this._c2d.has(c) ) throw new Error();
    const n = this._c2d.get(c);
    this._c2d.delete(c);
    if(n) this._d2c.delete(n);
  }

}

export const FNodeManager = NodeManager as IFeatureClass<INodeManager>;

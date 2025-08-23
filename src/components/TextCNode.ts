import type { AttributeSpecType } from "domlib";
import type { AbstractComponentStubParamsType } from "../types";
import { AbstractCNode, type AbstractCNodeParams } from "./AbstractCNode";
import { ElementHolder } from "./compositions/ElementHolder";
import { PlaceholderLogic } from "./compositions/PlaceholderLogic";

export type TextCNodeUniqueType =  {
  formatter?: (src:unknown)=>string;
  defaultValue?: unknown,
  value?: unknown,
}

export type TextCNodeDSLOptType = TextCNodeUniqueType & {
  tagName?: string,
  attributes?: AttributeSpecType
};

export type TextCNodeParamsType = AbstractCNodeParams & TextCNodeDSLOptType & { element: Element };

export type TextCNodeStubParamsType = AbstractComponentStubParamsType & TextCNodeDSLOptType & { id: string };

export type TextCNodeDSLType    = [string, TextCNodeDSLOptType] | [string];

export class TextCNode extends AbstractCNode {

  private _parts: {
    eh: ElementHolder,
    phl: PlaceholderLogic<string> }
  //////////////////////////////////////////////////////////////////////////////
  // with _parts.eh
  get element(){ return this._parts.eh.element }
  async getWholeNodes(){ return await this._parts.eh.getWholeNodes(); }
  async getFirstNode(){ return await this._parts.eh.getFirstNode(); }
  async getLastNode(){ return await this._parts.eh.getLastNode(); }
  async purgeManagedNodesFromParent(){ await this._parts.eh.purgeManagedNodesFromParent(); }
  override async dispose(){ await this._parts.eh.dispose(); }
  //----------------------------------------------------------------------------
  // with _parts.phl
  get data(){ return this._parts.phl.data; }
  get hasValue(){ return this._parts.phl.hasValue; }
  get value(){ return this._parts.phl.value; }
  get hasDefaultValue(){ return this._parts.phl.hasDefaultValue; }
  get defaultValue(){ return this._parts.phl.defaultValue; }
  coerce(v:unknown){ return this._parts.phl.coerce(v); }
  protected _setValue(v:unknown){ this._parts.phl._setValue(v); }
  async setValue(v:unknown){ await this._parts.phl.setValue(v); }
  //////////////////////////////////////////////////////////////////////////////
  override async fillValues(get: (name:string)=>unknown){
    await this.assertAvailable();
    await this.setValue(get(this.name));
  }

  constructor(params: TextCNodeParamsType){
    super(params);
    const coerce = params.formatter ?? String;
    this._parts = {
      eh: new ElementHolder({ ... this._partsParams(), element: params.element }),
      phl: new PlaceholderLogic({ ... this._partsParams(),
        coerce,
        // eslint-disable-next-line @typescript-eslint/require-await
        updateDOM: async ()=>{
          //await this.assertAvailable();
          this.logger.debug('TextCNode#updateDOM', this.data);
          //console.log('>>>', this.data);
          const elem = this.element;
          while(elem.firstChild) elem.removeChild( elem.firstChild );
          elem.appendChild(this.manager.document.createTextNode(this.data));
        },
        value: params.value,
        defaultValue: params.defaultValue
      })
    };
    this._parts.phl.init();
  }
}

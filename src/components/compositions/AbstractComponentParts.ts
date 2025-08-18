import type { AbstractCNode } from "../AbstractCNode";

export type AbstractComponentPartsParamsType = {
  owner:   AbstractCNode,
  setDOMBusy:      ()=>void,
  resolveDOMBusy:  ()=>void,
  requiresAlive:   ()=>void,
  assertAvailable: ()=>Promise<void>
};

export abstract class AbstractComponentParts <PT extends AbstractComponentPartsParamsType>{
  protected _params: PT;
  get owner(){   return this._params.owner; }
  get manager(){ return this.owner.manager; }
  get logger(){ return this.manager.logger.tag(this.constructor.name); }
  requiresAlive(){ this._params.requiresAlive(); }
  async assertAvailable(){ await this._params.assertAvailable(); }
  _setDOMBusy(){ this._params.setDOMBusy(); }
  _resolveDOMBusy(){ this._params.resolveDOMBusy(); }
  constructor(params: PT){ this._params = params; }
  init(){}
}

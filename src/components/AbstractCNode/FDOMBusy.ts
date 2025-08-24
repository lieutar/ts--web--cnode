import type { Constructor } from "@looper-utils/types";
import { Feature, fMixinTools, type IFeatureClass } from "qoop";

export interface IDOMBusy {
get isDOMBusy(): boolean;
_setDOMBusy(): void;
_resolveDOMBusy(): void;
assertAvailable(): Promise<void>;
}

export class DOMBusy extends Feature(){
  static applyFeature(Base: Constructor){
    const {self, d} = fMixinTools(DOMBusy as IFeatureClass);
    return class extends Base{
      get isDOMBusy():boolean{ return self(this).isDOMBusy; }
      _setDOMBusy     = d('_setDOMBusy')     as ()=>void;
      _resolveDOMBusy = d('_resolveDOMBusy') as ()=>void;
      assertAvailable = d('assertAvailable') as ()=>Promise<void>;
      constructor(... args: any[]){
        super(... args);
        new DOMBusy().inject(this);
      }
    }
  }

  protected _domReadyPromise:          Promise<void> | null = null;
  protected _domReadyPromise_resolver: (() => void)  | null = null;
  protected _domReadyPromise_rejector: ((reason?: any) => void) | null = null;

  get isDOMBusy(){ return this._domReadyPromise !== null; }

  _setDOMBusy(): void {
    if (this.isDOMBusy) {
      console.warn(`Component '${this.owner.id}' is already busy.`);
      return;
    }
    this.owner.manager.logger.tag('DOMBusy').debug(`_setDOMBusy ${this}`);
    this._domReadyPromise = new Promise((resolve, reject) => {
      this._domReadyPromise_resolver = resolve;
      this._domReadyPromise_rejector = reject;
    });
  }

  _resolveDOMBusy(): void {
    if (!this.isDOMBusy) {
      console.warn(`Component '${this.owner.id}' was not busy.`);
      return;
    }
    this.owner.manager.logger.tag('DOMBusy').debug(`_resolveDOMBusy ${this}`);
    if (this._domReadyPromise_resolver) {
      this._domReadyPromise_resolver();
      this._domReadyPromise_resolver = null;
      this._domReadyPromise_rejector = null;
    }
  }

  async assertAvailable(){
    this.owner.requiresAlive();
    if(!this.isDOMBusy) return;
    await this._domReadyPromise;
  }
}

export const FDOMBusy = DOMBusy as IFeatureClass<IDOMBusy>;

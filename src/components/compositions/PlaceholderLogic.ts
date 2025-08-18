import { AbstractComponentParts, type AbstractComponentPartsParamsType } from "./AbstractComponentParts";

type PlaceholderLogicPropsType<T> =  AbstractComponentPartsParamsType & {
    coerce: (src: unknown) => T,
    updateDOM: (src: T)=> Promise<void>,
    defaultValue?: unknown,
    value?: unknown
};

type PlaceholderLogicParamsType<T> =  Partial<PlaceholderLogicPropsType<T>>
  & Omit<PlaceholderLogicPropsType<T>, 'defaultValue' | 'value'>
  & AbstractComponentPartsParamsType;

export class PlaceholderLogic<T> extends AbstractComponentParts<PlaceholderLogicPropsType<T>>{

  private _coerce: (src: unknown) => T;
  get coerce(){ return this._coerce; }

  readonly updateDOMByData: ()=>Promise<void>;

  private _data: T;

  get data() {
    return this._data;
  }

  get hasValue() {
    return this.value !== undefined;
  }

  get hasDefaultValue() {
    return this.defaultValue !== undefined;
  }

  get value() { return this._params.value; }

  _setValue(value: unknown) {
    this._params.value = value;
    this._data = this.coerce(value);
  }

  async setValue(value: unknown) {
    this._setValue(value);
    await this.updateDOMByData();
  }

  get defaultValue() { return this._params.defaultValue; }

  constructor(params:PlaceholderLogicParamsType<T>) {
    super({defaultValue: undefined, value: undefined, ... params});
    this._coerce = params.coerce;

    //console.log('!!!', this.owner.name, this.value, this.defaultValue);

    if (params.value !== undefined) {
      this._data = this.coerce(this.value);
    } else {
      this._data = this.coerce(this.defaultValue);
    }

    this.updateDOMByData = async () => {
      this.logger.debug('updateDOMByData()', String(params.updateDOM));
      await params.updateDOM(this.data); }
    this._setDOMBusy();
  }

  override init(){
    this.logger.debug('init()', this.owner.toString());
    this.updateDOMByData()
      .then(() => { this._resolveDOMBusy() })
      .catch((e) => { throw e; });
  }
}

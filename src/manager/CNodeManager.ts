import { type IWindow } from "domlib";
import type { Logger } from 'fancy-logger';
import { Prop, Qoop, WithFeatures } from 'qoop';
import { FNodeManager } from './FNodeManager';
import { FMarkerManager } from './FMarkerManager';
import { FBuilder, getCurrentManager } from "./FBuilder";
import { gensym } from "@looper-utils/string";

export class CNodeManager extends WithFeatures(Qoop(Object), FNodeManager, FMarkerManager, FBuilder)
{
  @Prop() declare logger: Logger;
  @Prop() declare window: IWindow;
  get document(): Document { return this.window.document; }
  static getCurrentManager = getCurrentManager;
  //////////////////////////////////////////////////////////////////////////////
  gensym(): string { return `cnode-${gensym()}` }
  //////////////////////////////////////////////////////////////////////////////
  constructor (params: {window: IWindow, logger: Logger}){
    super({ ... params,  logger: params.logger.setTags('cnode') });
  }
}

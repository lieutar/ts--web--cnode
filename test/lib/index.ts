import { Logger } from 'fancy-logger';
import { JSDOM } from 'jsdom';
import { CNodeManager } from '@src/manager';
import { isTextNode, type IWindow } from 'domlib';
import { DOM2DOMProcessor } from 'dom-processor';

export function makeManager(){
  const logger = new Logger({});
  const window = new JSDOM().window;
  return new CNodeManager({window, logger});
}

export function makeDataRemover(window:IWindow){
  return DOM2DOMProcessor.withRules(window,
    { when: isTextNode,
      action: n => n
    },
    { element: '*',
      action(node:Node){
        const e = node as Element;
        const r = e.ownerDocument.createElement(e.tagName);
        for(const a of e.attributes){
          if(a.localName.match(/^data-/)) continue;
          r.setAttributeNode(a.cloneNode() as Attr);
        }
        r.appendChild(this.processChildren(e) as DocumentFragment);
        return r;
      }
    }
  );

}

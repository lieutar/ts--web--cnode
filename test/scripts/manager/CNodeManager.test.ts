import { CNodeManager } from '@src/index';
import { makeManager } from '@test-lib/*';
import { describe, expect, test } from 'vitest';

describe('CNodeManager', ()=>{
  const man = makeManager();
  test('basic',  ()=>{ expect(man instanceof CNodeManager).toBe(true); });
  test('gensym', ()=>{ expect(man.gensym()).not.toEqual(man.gensym()); });
});

# cnode

Simple implementation of GUI Component Framework.

This package is powered by  [domlib](https://github.com/lieutar/ts--dom--domlib)  .

## Create Components with DSL

``` typescript
const component = cnodeManager.create({c,$$,$}=>c(['div', {class: 'foo'},
  $('some-value-to-text', {}),
  $$('placeholder-some'),
  c('nestedComponent', ['div', {class: 'bar'}])
]));
```

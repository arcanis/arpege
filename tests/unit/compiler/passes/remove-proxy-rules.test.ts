import {compiler} from 'pegjs';

import './helpers';

describe(`compiler pass |removeProxyRules|`, () => {
  const {removeProxyRules} = compiler.passes.transform;

  describe(`when a proxy rule isn't listed in |allowedStartRules|`, () => {
    it(`updates references and removes it`, () => {
      expect(removeProxyRules).toChangeAST(`start = proxy\nproxy = proxied\nproxied = "a"`, {
        rules: [{
          name: `start`,
          expression: {
            type: `ruleRef`,
            name: `proxied`,
          },
        }, {
          name: `proxied`,
        }],
      }, {
        allowedStartRules: [`start`],
      });
    });
  });

  describe(`when a proxy rule is listed in |allowedStartRules|`, () => {
    it(`updates references but doesn't remove it`, () => {
      expect(removeProxyRules).toChangeAST(`start = proxy\nproxy = proxied\nproxied = "a"`, {
        rules: [{
          name: `start`,
          expression: {type: `ruleRef`, name: `proxied`},
        }, {
          name: `proxy`,
          expression: {type: `ruleRef`, name: `proxied`},
        }, {
          name: `proxied`,
        }],
      }, {
        allowedStartRules: [`start`, `proxy`],
      });
    });
  });
});

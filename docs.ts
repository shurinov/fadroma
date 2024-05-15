#!/usr/bin/env -S node --import=@ganesha/esbuild
import { readFileSync } from 'node:fs'
import { generateDocumentation } from '@hackbg/docs'
generateDocumentation({
  data: JSON.parse(readFileSync('docs.json', 'utf8')),
  pages: {
    'doc/core.md':        { sources: ['agent-core.ts'] },
    'doc/chain.md':       { sources: ['agent-chain.ts'] },
    'doc/deploy.md':      { sources: ['agent-deploy.ts'] },
    'doc/governance.md':  { sources: ['agent-governance.ts'] },
    'doc/compute.md':     { sources: ['agent-compute.browser.ts', 'agent-compute.ts'] },
    'doc/staking.md':     { sources: ['agent-staking.ts'] },
    'doc/store.md':       { sources: ['agent-store.ts'] },
    'doc/token.md':       { sources: ['agent-token.ts'] },
    'doc/tx.md':          { sources: ['agent-tx.ts'] },

    'stub/README.md': { sources: ['stub/stub.ts'] },
  }
})

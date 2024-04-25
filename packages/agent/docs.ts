#!/usr/bin/env -S node --import=@ganesha/esbuild

import { readFileSync } from 'node:fs'
import { documentModule } from '@hackbg/docs'

const data = JSON.parse(readFileSync('docs.json', 'utf8'))

documentModule({ data, target: 'core.md',       sources: ['core.ts'],                          })
documentModule({ data, target: 'chain.md',      sources: ['chain.ts'],                         })
documentModule({ data, target: 'deploy.md',     sources: ['deploy.ts'],                        })
documentModule({ data, target: 'governance.md', sources: ['governance.ts'],                    })
documentModule({ data, target: 'identity.md',   sources: ['identity.ts'],                      })
documentModule({ data, target: 'program.md',    sources: ['program.browser.ts', 'program.ts'], })
documentModule({ data, target: 'staking.md',    sources: ['staking.ts'],                       })
documentModule({ data, target: 'store.md',      sources: ['store.ts'],                         })
documentModule({ data, target: 'stub.md',       sources: ['stub.ts'],                          })
documentModule({ data, target: 'token.md',      sources: ['token.ts'],                         })
documentModule({ data, target: 'tx.md',         sources: ['tx.ts'],                            })

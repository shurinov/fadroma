#!/usr/bin/env -S node --import=@ganesha/esbuild

import { readFileSync } from 'node:fs'
import { documentModule } from '@hackbg/docs'

documentModule({
  data: JSON.parse(readFileSync('docs.json', 'utf8')),
  sources: ['deploy.ts']
})

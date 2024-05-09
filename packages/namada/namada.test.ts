import Namada, { initDecoder } from './namada'
import { NamadaConsole } from './namada-console'
import init, { Decode } from './pkg/fadroma_namada.js'
import { readFileSync } from 'node:fs'

const console = new NamadaConsole('test')

export default async function main () {
  await initDecoder(readFileSync('./pkg/fadroma_namada_bg.wasm'))
  const namada = await Namada.connect({
    url: 'https://namada-testnet-rpc.itrocket.net'
  })
  console.log(await namada.getDelegationsAt(
    'tnam1qpr2uzf9pgrd6sucp34wq5gss5rm2un5lszcwzqc'
  ))
  const test = await namada.getValidators({
    details:         true,
    parallel:        false,
    parallelDetails: true,
  });
  //console.log({test})
  //console.log(await (await connection.getValidator('tnam1q9sdarpylwxd5vv3e8u6wstrpz052jhls5g4a3wg')).fetchDetails(connection))
  //console.log(connection.decode.address(new Uint8Array([
    //0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  //])))
  //let block
  //let height = 100000
  //do {
    //block = await connection.getBlock(Number(height))
    //height = block.header.height
    //console.log()
      //.log('Block:', bold(block.header.height))
      //.log('ID:   ', bold(block.id))
      //.log('Time: ', bold(block.header.time))
      //.log(bold('Transactions:'))
    //for (const tx of block.txsDecoded) {
      //console.printTx(tx)
      //console.printTxSections(tx.sections)
      //console.log({content: tx.content})
    //}
    //console.br()
    //height--
  //} while (height > 0)
  //console.log({block})
}

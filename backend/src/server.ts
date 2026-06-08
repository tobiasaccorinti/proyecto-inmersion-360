/**
 * Servidor HTTP — inicia Express en el puerto configurado.
 */

import app from './app'
import { env } from './config/env'

app.listen(env.port, () => {
  console.log(`🚀  Inspira Backend corriendo en http://localhost:${env.port}`)
  console.log(`   Entorno: ${env.nodeEnv}`)
})

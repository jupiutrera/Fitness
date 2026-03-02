// Genera iconos PNG básicos para el PWA usando Canvas API de Node
// Ejecutar con: node generate-icons.mjs

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  const r = size * 0.2
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fillStyle = '#111827'
  ctx.fill()

  const cx = size / 2
  const cy = size / 2
  const ringR = size * 0.35
  const lw = size * 0.08

  // Ring track
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2)
  ctx.strokeStyle = '#1f2937'
  ctx.lineWidth = lw
  ctx.stroke()

  // Ring progress
  ctx.beginPath()
  ctx.arc(cx, cy, ringR, -Math.PI / 2, Math.PI)
  ctx.strokeStyle = '#6366f1'
  ctx.lineWidth = lw
  ctx.lineCap = 'round'
  ctx.stroke()

  // Letter M
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.28}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('M', cx, cy + size * 0.02)

  return canvas.toBuffer('image/png')
}

try {
  writeFileSync('./public/icon-192.png', drawIcon(192))
  writeFileSync('./public/icon-512.png', drawIcon(512))
  console.log('✓ Iconos generados: public/icon-192.png y public/icon-512.png')
} catch (e) {
  console.log('Sin módulo canvas. Usa el icono SVG o genera los PNG manualmente.')
  console.log('Puedes instalar: npm install -D canvas')
}

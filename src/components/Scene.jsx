import React, { useEffect, useRef } from 'react'
import { rtdb, auth } from '../firebase'
import {
  ref as dbRef,
  set,
  onDisconnect,
  onValue,
  remove,
  off
} from 'firebase/database'
import { onAuthStateChanged } from 'firebase/auth'
import { mapData } from '../mapData'

export default function Scene({ role, onZoneChange, onInteract }) {
  const containerRef = useRef(null)
  const appRef = useRef(null)
  const playerRef = useRef({ x: 450, y: 550 })
  const othersRef = useRef(new Map())
  const uidRef = useRef(null)
  
  const onZoneChangeRef = useRef(onZoneChange)
  const onInteractRef = useRef(onInteract)
  const roleRef = useRef(role)
  const lastZoneRef = useRef(null)

  useEffect(() => {
    onZoneChangeRef.current = onZoneChange
    onInteractRef.current = onInteract
    roleRef.current = role
  }, [onZoneChange, onInteract, role])

  useEffect(() => {
    let cancelled = false
    let PIXI
    let world
    let me = null
    let onKey
    let unsubAuth
    let playersRef
    let listener
    let collisionRects = []

    const createCharacter = (PIXI, isMe, name, userRole) => {
      const charContainer = new PIXI.Container()
      const graphics = new PIXI.Graphics()
      graphics.ellipse(0, 8, 10, 4).fill({ color: 0x000000, alpha: 0.2 })
      const mainColor = isMe ? (userRole === 'teacher' ? 0xe53935 : 0x1e88e5) : 0x9e9e9e
      graphics.rect(-8, -10, 16, 18).fill(mainColor)
      graphics.rect(-8, 4, 16, 4).fill(0x3949ab)
      graphics.rect(-7, -24, 14, 14).fill(0xffdbac)
      graphics.rect(-8, -26, 16, 6).fill(0x4e342e)
      graphics.rect(-8, -24, 4, 10).fill(0x4e342e)
      graphics.rect(4, -24, 4, 10).fill(0x4e342e)
      graphics.rect(-4, -18, 2, 2).fill(0x000000)
      graphics.rect(2, -18, 2, 2).fill(0x000000)
      charContainer.addChild(graphics)
      charContainer.body = graphics
      const label = new PIXI.Text({
        text: name,
        style: { fill: 0xffffff, fontSize: 11, fontWeight: 'bold', stroke: { color: 0x000000, width: 3 }, lineJoin: 'round' }
      })
      label.anchor.set(0.5, 1); label.y = -28; charContainer.addChild(label)
      return charContainer
    }

    const init = async () => {
      const mod = await import('pixi.js')
      PIXI = mod.default ? mod.default : mod
      if (cancelled) return

      const app = new PIXI.Application()
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: mapData.hallway.bgColor,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        resizeTo: window,
      })

      if (cancelled) {
        app.destroy(true, { children: true, texture: true })
        return
      }

      appRef.current = app
      if (containerRef.current) containerRef.current.appendChild(app.canvas)

      world = new PIXI.Container()
      app.stage.addChild(world)

      const ground = new PIXI.Graphics()
      ground.rect(0, 0, mapData.worldWidth, mapData.worldHeight).fill(mapData.hallway.bgColor)
      for (let x = 0; x < mapData.worldWidth; x += 40) {
        ground.moveTo(x, 0).lineTo(x, mapData.worldHeight).stroke({ color: 0xd0d0d0, width: 1 })
      }
      for (let y = 0; y < mapData.worldHeight; y += 40) {
        ground.moveTo(0, y).lineTo(mapData.worldWidth, y).stroke({ color: 0xd0d0d0, width: 1 })
      }
      world.addChild(ground)

      mapData.rooms.forEach(room => {
        const roomContainer = new PIXI.Container()
        roomContainer.x = room.x; roomContainer.y = room.y
        world.addChild(roomContainer)

        const bg = new PIXI.Graphics()
          .rect(0, 0, room.w, room.h).fill(room.bgColor)
          .rect(0, 0, room.w, room.h).stroke({ color: 0xd7ccc8, width: 2 })
        roomContainer.addChild(bg)

        const wallT = 20, wallColor = 0x4e342e, wallTopColor = 0x8d6e63
        const addWall = (rx, ry, rw, rh) => {
          if (rw <= 0 || rh <= 0) return
          const g = new PIXI.Graphics().rect(rx, ry, rw, rh).fill(wallColor).rect(rx, ry, rw, 4).fill(wallTopColor)
          roomContainer.addChild(g)
          collisionRects.push({ x: room.x + rx, y: room.y + ry, w: rw, h: rh })
        }

        const door = room.door
        const isDoorTop = door.y <= room.y + 5, isDoorBottom = (door.y + door.h) >= (room.y + room.h - 5)
        const isDoorLeft = door.x <= room.x + 5, isDoorRight = (door.x + door.w) >= (room.x + room.w - 5)

        if (isDoorTop) {
          addWall(0, 0, door.x - room.x, wallT)
          addWall(door.x - room.x + door.w, 0, room.w - (door.x - room.x + door.w), wallT)
        } else { addWall(0, 0, room.w, wallT) }
        if (isDoorBottom) {
          addWall(0, room.h - wallT, door.x - room.x, wallT)
          addWall(door.x - room.x + door.w, room.h - wallT, room.w - (door.x - room.x + door.w), wallT)
        } else { addWall(0, room.h - wallT, room.w, wallT) }
        if (isDoorLeft) {
          addWall(0, 0, wallT, door.y - room.y)
          addWall(0, door.y - room.y + door.h, wallT, room.h - (door.y - room.y + door.h))
        } else { addWall(0, 0, wallT, room.h) }
        if (isDoorRight) {
          addWall(room.w - wallT, 0, wallT, door.y - room.y)
          addWall(room.w - wallT, door.y - room.y + door.h, wallT, room.h - (door.y - room.y + door.h))
        } else { addWall(room.w - wallT, 0, wallT, room.h) }

        const doorGraphic = new PIXI.Graphics().rect(door.x - room.x, door.y - room.y, door.w, door.h).fill({ color: 0x5d4037, alpha: 0.8 })
        roomContainer.addChild(doorGraphic)

        room.objects.forEach(obj => {
          const g = new PIXI.Graphics()
          if (obj.type === 'board') {
            g.rect(obj.x - room.x, obj.y - room.y, obj.w, obj.h).fill(0x3e2723)
            g.rect(obj.x - room.x + 4, obj.y - room.y + 4, obj.w - 8, obj.h - 8).fill(obj.color)
          } else if (obj.type === 'desk' || obj.type === 'desk_small' || obj.type === 'table') {
            g.rect(obj.x - room.x, obj.y - room.y, obj.w, obj.h).fill(0x3e2723)
            g.rect(obj.x - room.x, obj.y - room.y - 4, obj.w, obj.h).fill(obj.color)
          } else if (obj.type === 'plant') {
            g.circle(obj.x - room.x + 16, obj.y - room.y + 16, 12).fill(0x8d6e63)
            g.circle(obj.x - room.x + 16, obj.y - room.y + 8, 14).fill(0x4caf50)
          } else {
            g.rect(obj.x - room.x, obj.y - room.y, obj.w, obj.h).fill(obj.color)
          }
          roomContainer.addChild(g)
          if (obj.type !== 'rug') collisionRects.push({ x: obj.x, y: obj.y, w: obj.w, h: obj.h })
          if (obj.label) {
            const text = new PIXI.Text({ text: obj.label, style: { fill: 0xffffff, fontSize: 12, fontWeight: 'bold' } })
            text.anchor.set(0.5); text.x = (obj.x - room.x) + obj.w / 2; text.y = (obj.y - room.y) + obj.h / 2
            roomContainer.addChild(text)
          }
        })
      })

      me = createCharacter(PIXI, true, 'BẠN', roleRef.current)
      me.x = playerRef.current.x; me.y = playerRef.current.y
      world.addChild(me)

      const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, KeyW: false, KeyA: false, KeyS: false, KeyD: false }
      onKey = (e) => {
        if (keys.hasOwnProperty(e.code)) { e.preventDefault(); keys[e.code] = e.type === 'keydown' }
        if (e.type === 'keydown' && e.code === 'KeyE') {
          const { x, y } = playerRef.current
          const zone = mapData.rooms.flatMap(r => r.objects).find(obj => x >= obj.x - 25 && x <= obj.x + obj.w + 25 && y >= obj.y - 25 && y <= obj.y + obj.h + 25)
          if (zone && onInteractRef.current) onInteractRef.current(zone.id)
        }
      }
      window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKey)

      let walkTime = 0
      const update = (ticker) => {
        if (!me || !world) return
        for (const s of othersRef.current.values()) {
          if (s && s.targetX != null && s.targetY != null) {
            s.x += (s.targetX - s.x) * 0.25
            s.y += (s.targetY - s.y) * 0.25
          }
        }
        let dx = 0, dy = 0
        if (keys.ArrowUp || keys.KeyW) dy -= 1
        if (keys.ArrowDown || keys.KeyS) dy += 1
        if (keys.ArrowLeft || keys.KeyA) dx -= 1
        if (keys.ArrowRight || keys.KeyD) dx += 1
        if (dx !== 0 || dy !== 0) {
          const speed = 240, step = (speed / 60) * ticker.deltaTime, len = Math.hypot(dx, dy)
          const nx = playerRef.current.x + (dx / len) * step, ny = playerRef.current.y + (dy / len) * step
          const checkCol = (tx, ty) => {
            const r = 8
            if (tx < r || tx > mapData.worldWidth - r || ty < r || ty > mapData.worldHeight - r) return true
            return collisionRects.some(rect => tx > rect.x - r && tx < rect.x + rect.w + r && ty > rect.y - r && ty < rect.y + rect.h + r)
          }
          if (!checkCol(nx, playerRef.current.y)) playerRef.current.x = nx
          if (!checkCol(playerRef.current.x, ny)) playerRef.current.y = ny
          me.x = playerRef.current.x; me.y = playerRef.current.y
          walkTime += ticker.deltaTime * 0.25; me.body.y = Math.sin(walkTime) * 3
          if (dx !== 0) me.body.scale.x = dx < 0 ? -1 : 1
          const currentRoom = mapData.rooms.find(r => playerRef.current.x >= r.x && playerRef.current.x <= r.x + r.w && playerRef.current.y >= r.y && playerRef.current.y <= r.y + r.h)
          const currentObj = currentRoom?.objects.find(o => playerRef.current.x >= o.x && playerRef.current.x <= o.x + o.w && playerRef.current.y >= o.y && playerRef.current.y <= o.y + o.h)
          const zoneId = currentObj ? currentObj.id : (currentRoom ? currentRoom.id : null)
          if (zoneId !== lastZoneRef.current) {
            lastZoneRef.current = zoneId
            if (onZoneChangeRef.current) onZoneChangeRef.current(zoneId)
          }
        } else { if (me.body) me.body.y = 0 }
        const targetCamX = Math.min(0, Math.max((app.screen.width / 2) - playerRef.current.x, app.screen.width - mapData.worldWidth))
        const targetCamY = Math.min(0, Math.max((app.screen.height / 2) - playerRef.current.y, app.screen.height - mapData.worldHeight))
        world.x += (targetCamX - world.x) * 0.2; world.y += (targetCamY - world.y) * 0.2
      }
      app.ticker.add(update)

      unsubAuth = onAuthStateChanged(auth, (user) => {
        if (!user) return
        uidRef.current = user.uid
        const myRef = dbRef(rtdb, `world/players/${user.uid}`)
        onDisconnect(myRef).remove()
        playersRef = dbRef(rtdb, `world/players`)
        listener = onValue(playersRef, (snap) => {
          const data = snap.val() || {}, seen = new Set()
          for (const id in data) {
            if (id === user.uid) continue
            seen.add(id)
            if (!othersRef.current.has(id)) {
              const s = createCharacter(PIXI, false, data[id].email?.split('@')[0] || 'User', 'student')
              world.addChild(s)
              othersRef.current.set(id, s)
            }
            const s = othersRef.current.get(id)
            if (!s || s.destroyed) { othersRef.current.delete(id); continue }
            if (data[id].x == null || data[id].y == null) continue
            if (s.targetX == null) {
              s.x = data[id].x; s.y = data[id].y; s.targetX = data[id].x; s.targetY = data[id].y
            } else { s.targetX = data[id].x; s.targetY = data[id].y }
          }
          for (const [id, s] of Array.from(othersRef.current.entries())) {
            if (!seen.has(id)) {
              if (world && s) world.removeChild(s)
              if (s && !s.destroyed) s.destroy()
              othersRef.current.delete(id)
            }
          }
        })
      })

      let lastPush = 0
      const pushPos = () => {
        const now = Date.now()
        if (uidRef.current && now - lastPush > 250) {
          set(dbRef(rtdb, `world/players/${uidRef.current}`), {
            x: playerRef.current.x, y: playerRef.current.y, ts: now, email: auth.currentUser.email
          })
          lastPush = now
        }
      }
      app.ticker.add(pushPos)

      return () => {
        app.ticker.remove(update)
        app.ticker.remove(pushPos)
        if (unsubAuth) unsubAuth()
        if (playersRef && listener) off(playersRef, 'value', listener)
        if (uidRef.current) remove(dbRef(rtdb, `world/players/${uidRef.current}`))
        app.destroy(true, { children: true, texture: true })
      }
    }

    const cleanupPromise = init()
    return () => {
      cancelled = true
      window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey)
      cleanupPromise.then(cleanup => { if (cleanup) cleanup() })
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh', background: '#000', overflow: 'hidden' }} />
}

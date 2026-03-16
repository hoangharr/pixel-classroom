export const mapData = {
  // Mở rộng thế giới
  worldWidth: 2500,
  worldHeight: 1800,
  
  // Khu vực đảo (đất liền)
  island: {
    x: 200,
    y: 200,
    w: 2100,
    h: 1400,
    bgColor: 0xe0e0e0,
    wallColor: 0x5d4037
  },

  hallway: {
    bgColor: 0xe0e0e0
  },
  
  rooms: [
    {
      id: 'classroom_1',
      name: 'Phòng học 1',
      x: 400,
      y: 400,
      w: 500,
      h: 400,
      bgColor: 0xffecb3,
      door: { x: 620, y: 800, w: 60, h: 10 },
      objects: [
        { id: 'board_1', type: 'board', x: 550, y: 410, w: 200, h: 20, color: 0x2e7d32, label: 'BẢNG ĐIỂM DANH' },
        { id: 'desk_teacher', type: 'desk', x: 600, y: 460, w: 100, h: 40, color: 0x8d6e63, label: 'Bàn GV' },
        // Ghế hàng 1
        { id: 'seat_1', type: 'seat', x: 450, y: 550, w: 35, h: 35, color: 0x795548 },
        { id: 'seat_2', type: 'seat', x: 520, y: 550, w: 35, h: 35, color: 0x795548 },
        { id: 'seat_3', type: 'seat', x: 590, y: 550, w: 35, h: 35, color: 0x795548 },
        { id: 'seat_4', type: 'seat', x: 660, y: 550, w: 35, h: 35, color: 0x795548 },
        { id: 'seat_5', type: 'seat', x: 730, y: 550, w: 35, h: 35, color: 0x795548 },
        // Ghế hàng 2
        { id: 'seat_6', type: 'seat', x: 450, y: 620, w: 35, h: 35, color: 0x795548 },
        { id: 'seat_7', type: 'seat', x: 520, y: 620, w: 35, h: 35, color: 0x795548 },
        { id: 'seat_8', type: 'seat', x: 590, y: 620, w: 35, h: 35, color: 0x795548 },
        { id: 'seat_9', type: 'seat', x: 660, y: 620, w: 35, h: 35, color: 0x795548 },
        { id: 'seat_10', type: 'seat', x: 730, y: 620, w: 35, h: 35, color: 0x795548 }
      ]
    },
    {
      id: 'library',
      name: 'Thư viện',
      x: 1100,
      y: 400,
      w: 600,
      h: 500,
      bgColor: 0xdcedc8,
      door: { x: 1100, y: 600, w: 10, h: 80 },
      objects: [
        { id: 'bookshelf_1', type: 'shelf', x: 1150, y: 450, w: 500, h: 40, color: 0x5d4037, label: 'Kệ Ngữ Pháp' },
        { id: 'table_reading', type: 'table', x: 1300, y: 650, w: 200, h: 100, color: 0x8d6e63, label: 'Bàn Từ Điển' },
        { id: 'plant_1', type: 'plant', x: 1650, y: 850, w: 30, h: 30 }
      ]
    },
    {
      id: 'entertainment',
      name: 'Phòng giải trí',
      x: 400,
      y: 950,
      w: 500,
      h: 300,
      bgColor: 0xb3e5fc,
      door: { x: 900, y: 1050, w: 10, h: 60 },
      objects: [
        { id: 'rug', type: 'rug', x: 550, y: 1050, w: 200, h: 100, color: 0xffccbc },
        { id: 'music_player', type: 'device', x: 450, y: 1000, w: 50, h: 50, color: 0x424242, label: 'Loa' }
      ]
    }
  ]
}

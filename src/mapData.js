export const mapData = {
  worldWidth: 1200,
  worldHeight: 800,
  hallway: {
    bgColor: 0xe0e0e0
  },
  rooms: [
    {
      id: 'classroom_1',
      name: 'Phòng học 1',
      x: 100,
      y: 100,
      w: 400,
      h: 350, // Tăng nhẹ chiều cao
      bgColor: 0xffecb3,
      door: { x: 250, y: 450, w: 60, h: 10 },
      objects: [
        { id: 'board_1', type: 'board', x: 200, y: 110, w: 200, h: 20, color: 0x2e7d32, label: 'BẢNG ĐIỂM DANH' },
        { id: 'desk_teacher', type: 'desk', x: 250, y: 160, w: 100, h: 40, color: 0x8d6e63, label: 'Bàn GV' },
        
        // Hàng ghế 1
        { id: 'seat_1', type: 'seat', x: 130, y: 240, w: 30, h: 30, color: 0x795548 },
        { id: 'seat_2', type: 'seat', x: 190, y: 240, w: 30, h: 30, color: 0x795548 },
        { id: 'seat_3', type: 'seat', x: 250, y: 240, w: 30, h: 30, color: 0x795548 },
        { id: 'seat_4', type: 'seat', x: 310, y: 240, w: 30, h: 30, color: 0x795548 },
        { id: 'seat_5', type: 'seat', x: 370, y: 240, w: 30, h: 30, color: 0x795548 },
        
        // Hàng ghế 2
        { id: 'seat_6', type: 'seat', x: 130, y: 300, w: 30, h: 30, color: 0x795548 },
        { id: 'seat_7', type: 'seat', x: 190, y: 300, w: 30, h: 30, color: 0x795548 },
        { id: 'seat_8', type: 'seat', x: 250, y: 300, w: 30, h: 30, color: 0x795548 },
        { id: 'seat_9', type: 'seat', x: 310, y: 300, w: 30, h: 30, color: 0x795548 },
        { id: 'seat_10', type: 'seat', x: 370, y: 300, w: 30, h: 30, color: 0x795548 }
      ]
    },
    {
      id: 'library',
      name: 'Thư viện',
      x: 600,
      y: 100,
      w: 500,
      h: 400,
      bgColor: 0xdcedc8,
      door: { x: 600, y: 300, w: 10, h: 80 },
      objects: [
        { id: 'bookshelf_1', type: 'shelf', x: 650, y: 150, w: 400, h: 40, color: 0x5d4037, label: 'Kệ Ngữ Pháp' },
        { id: 'table_reading', type: 'table', x: 800, y: 300, w: 150, h: 80, color: 0x8d6e63, label: 'Bàn Từ Điển' },
        { id: 'plant_1', type: 'plant', x: 1050, y: 450, w: 30, h: 30 }
      ]
    },
    {
      id: 'entertainment',
      name: 'Phòng giải trí',
      x: 100,
      y: 550, // Chỉnh lại vị trí để không đè phòng học
      w: 400,
      h: 200,
      bgColor: 0xb3e5fc,
      door: { x: 500, y: 620, w: 10, h: 60 },
      objects: [
        { id: 'rug', type: 'rug', x: 200, y: 600, w: 150, h: 80, color: 0xffccbc },
        { id: 'music_player', type: 'device', x: 150, y: 580, w: 40, h: 40, color: 0x424242, label: 'Loa' }
      ]
    }
  ]
}

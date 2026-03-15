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
      h: 300,
      bgColor: 0xffecb3,
      door: { x: 250, y: 400, w: 60, h: 10 },
      objects: [
        { id: 'board_1', type: 'board', x: 200, y: 120, w: 200, h: 20, color: 0x2e7d32, label: 'Bảng' },
        { id: 'desk_teacher', type: 'desk', x: 250, y: 180, w: 100, h: 50, color: 0x8d6e63, label: 'Bàn GV' },
        { id: 'desk_student_1', type: 'desk_small', x: 150, y: 280, w: 60, h: 40, color: 0xa1887f },
        { id: 'desk_student_2', type: 'desk_small', x: 390, y: 280, w: 60, h: 40, color: 0xa1887f }
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
        { id: 'bookshelf_1', type: 'shelf', x: 650, y: 150, w: 400, h: 40, color: 0x5d4037, label: 'Sách tham khảo' },
        { id: 'table_reading', type: 'table', x: 800, y: 300, w: 150, h: 80, color: 0x8d6e63, label: 'Bàn đọc' },
        { id: 'plant_1', type: 'plant', x: 1050, y: 450, w: 30, h: 30 }
      ]
    },
    {
      id: 'entertainment',
      name: 'Phòng giải trí',
      x: 100,
      y: 500,
      w: 400,
      h: 250,
      bgColor: 0xb3e5fc,
      door: { x: 500, y: 600, w: 10, h: 60 },
      objects: [
        { id: 'rug', type: 'rug', x: 200, y: 600, w: 200, h: 100, color: 0xffccbc },
        { id: 'music_player', type: 'device', x: 150, y: 550, w: 40, h: 40, color: 0x424242, label: 'Loa' }
      ]
    }
  ]
}

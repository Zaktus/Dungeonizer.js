class Walls {
    constructor(dungeonRooms, tunnels) {
        this.walls = [];
        this.dungeonRooms = dungeonRooms;
        this.tunnels = tunnels;

        this.createRoomWalls();
        this.createTunnelWalls();
    }

    createRoomWalls() {
        const rooms = this.dungeonRooms;
        let roomPerimeter = null;
        for (let i = 0; i < rooms.length; i++) {
            roomPerimeter = this.createRoomPerimeterWall(rooms[i]);
            Array.prototype.push.apply(this.walls, roomPerimeter);
        }
    }

    createRoomPerimeterWall(room) {
        const x1 = room.x - room.w / 2; // todo: +/- 1's
        const x2 = room.x + room.w / 2;
        const y1 = room.y - room.h / 2;
        const y2 = room.y + room.h / 2;

        const roomPerimeter = [
            x1, y1, x1, y2,
            x1, y2, x2, y2,
            x2, y1, x2, y2,
            x1, y1, x2, y1
        ];
        return roomPerimeter;
    }

    // under assumption x1 <= x2 and y1 <= y2 for tunnels
    createTunnelWalls() {
        const tunnels = this.tunnels;
        let tunnelWalls = null;

        for (let i = 0; i < tunnels.length; i += 4) {
            tunnelWalls = this.createTunnelWall(tunnels[i], tunnels[i + 1], tunnels[i + 2], tunnels[i + 3]);
            Array.prototype.push.apply(this.walls, tunnelWalls);
        }
    }

    createTunnelWall(ax, ay, bx, by) {
        // sorting and -1 / +1 for handling L-shapes
        const isHorizontal = Math.abs(ax - bx) > Math.abs(ay - by);
        let tunnelWalls;
        if (isHorizontal) {
            tunnelWalls = [ax - 1, ay - 1, bx + 1, ay - 1, ax - 1, ay + 1, bx + 1, ay + 1];
        } else {
            tunnelWalls = [ax - 1, ay - 1, ax - 1, by + 1, ax + 1, ay - 1, ax + 1, by + 1];
        }

        return tunnelWalls;
    }

    removeWallWallIntersections() {
        this.removeSegmentsIntersections(this.walls, true);
    }

    removeRoomWallIntersections() {
        const rooms = this.dungeonRooms;
        const innerPerimeters = [];
        for (let i = 0; i < rooms.length; i++) {
            const x1 = rooms[i].x - rooms[i].w / 2 + 1;
            const x2 = rooms[i].x + rooms[i].w / 2 - 1;
            const y1 = rooms[i].y - rooms[i].h / 2 + 1;
            const y2 = rooms[i].y + rooms[i].h / 2 - 1;
            innerPerimeters.push(
                x1, y1, x1, y2,
                x1, y2, x2, y2,
                x2, y1, x2, y2,
                x1, y1, x2, y1
            );
        }
        this.removeSegmentsIntersections(innerPerimeters, false);
    }

    removeTunnelWallIntersections() {
        this.removeSegmentsIntersections(this.tunnels, false);
    }

    // under assumption x1 <= x2 and y1 <= y2 for tunnels
    removeSegmentsIntersections(tunnels, isWalls) {
        const walls = this.walls;
        let startWallsLength = 0;
        let newWallsAmount = walls.length - startWallsLength;

        while (newWallsAmount > 0) {
            startWallsLength = walls.length;
            for (let j = 0; j < walls.length; j += 4) {
                for (let i = 0; i < (isWalls ? j : tunnels.length); i += 4) {
                    const pieces = this.resolveSegmentSegment(
                        tunnels[i], tunnels[i + 1], tunnels[i + 2], tunnels[i + 3],
                        walls[j], walls[j + 1], walls[j + 2], walls[j + 3]
                    );
                    if (pieces.length < 4) { // todo: perform wall removal
                        walls[j] = 10000 + i;
                        walls[j + 1] = 10000 + i;
                        walls[j + 2] = 10000 + i + 1;
                        walls[j + 3] = 10000 + i + 1;
                    } else {
                        walls[j] = pieces[0];
                        walls[j + 1] = pieces[1];
                        walls[j + 2] = pieces[2];
                        walls[j + 3] = pieces[3];

                        if (pieces.length > 4) {
                            walls.push(pieces[4]);
                            walls.push(pieces[5]);
                            walls.push(pieces[6]);
                            walls.push(pieces[7]);
                        }
                    }
                }
            }
            newWallsAmount = walls.length - startWallsLength;
        }
    }

    // first segment always remains unchanged, second could and will break into 0, 1 or 2 pieces
    resolveSegmentSegment(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
        const result = [];
        // todo: replace with less ugly check for possible intersection :D
        if (((ax1 <= bx2 && ax1 >= bx1) || (ax2 <= bx2 && ax2 >= bx1) || (bx1 <= ax2 && bx1 >= ax1) || (bx2 <= ax2 && bx2 >= ax1)) &&
        ((ay2 <= by2 && ay2 >= by1) || (ay1 <= by2 && ay1 >= by1) || (by2 <= ay2 && by2 >= ay1) || (by1 <= ay2 && by1 >= ay1))) { // segments intersect

            if (by2 - by1 < bx2 - bx1) { // horizontal b breaks
                if (bx1 < ax1) {
                    result.push(bx1, by1, ax1 - 1, by1);
                }
                if (bx2 > ax2) {
                    result.push(ax2 + 1, by2, bx2, by2);
                }
            } else { // vertical b breaks
                if (by1 < ay1) {
                    result.push(bx1, by1, bx1, ay1 - 1);
                }
                if (by2 > ay2) {
                    result.push(bx2, ay2 + 1, bx2, by2);
                }
            }
        } else { // segments do not intersect
            result.push(bx1, by1, bx2, by2);
        }

        return result;
    }
}

export default Walls;
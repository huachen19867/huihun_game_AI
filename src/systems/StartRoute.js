import { Maps } from '../data/Maps.js';

export function resolveStartRoute(search = '') {
    const params = new URLSearchParams(search);
    const mapId = params.get('map');

    if (!mapId || !Maps[mapId]) {
        return { scene: 'IntroScene', data: undefined };
    }

    const data = { mapId };
    const x = params.has('x') ? Number(params.get('x')) : NaN;
    const y = params.has('y') ? Number(params.get('y')) : NaN;
    if (Number.isFinite(x)) data.x = x;
    if (Number.isFinite(y)) data.y = y;

    return { scene: 'GameScene', data };
}

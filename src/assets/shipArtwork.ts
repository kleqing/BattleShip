import carrierArtwork from './Carrier.png';
import submarineArtwork from './Submarine.png';
import destroyerArtwork from './Destroyer.png';

import carrierFireArtwork from './Carrier Fire.png';
import submarineFireArtwork from './Submarine Fire.png';
import destroyerFireArtwork from './Destroyer Fire.png';

export const SHIP_ARTWORK_MAP: Record<string, string> = {
    Carrier: carrierArtwork,
    Submarine: submarineArtwork,
    Destroyer: destroyerArtwork,
};

export const SHIP_FIRE_ARTWORK_MAP: Record<string, string> = {
    Carrier: carrierFireArtwork,
    Submarine: submarineFireArtwork,
    Destroyer: destroyerFireArtwork,
};

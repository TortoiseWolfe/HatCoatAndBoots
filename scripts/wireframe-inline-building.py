#!/usr/bin/env python3
"""Emit the wireframe's <g id="building"> block with the REAL chapter SVG bodies
inlined (not <image href>, which doesn't paint in standalone SVG view). The 7 Hat
layers all live in a shared 0 0 360 360 space and have unique <defs> ids, so they
composite into one <g> safely. Parameterised by translate, scale, and per-region
opacity so the same building serves the index (all 1.0) and each chapter focus."""
import re
import sys

LAYERS_BY_REGION = {
    'boots': ['footing'],
    'coat': ['wall', 'window'],
    'hat': ['roof-overhang', 'sun-high', 'sun-low', 'rain'],
}


def body(name):
    raw = open(f'public/book/hat/{name}.svg').read()
    inner = re.sub(r'^[\s\S]*?<svg[^>]*>', '', raw)
    inner = re.sub(r'</svg>\s*$', '', inner)
    # Strip XML comments — the wireframe validator's regex misreads "x=150..242"
    # inside SVG comments as unquoted attributes.
    inner = re.sub(r'<!--[\s\S]*?-->', '', inner)
    # Strip tiny in-art <text> labels (e.g. a 9px "shade") — the wireframe carries
    # its own labels/annotations, and the validator enforces a 14px text minimum.
    inner = re.sub(r'<text\b[\s\S]*?</text>', '', inner)
    # collapse the blank lines the removals leave
    inner = re.sub(r'\n\s*\n', '\n', inner).strip()
    return inner


def building(translate, scale, opac, gid='building'):
    out = [f'      <g id="{gid}" transform="translate({translate}) scale({scale})">']
    for region in ['boots', 'coat', 'hat']:  # back-to-front
        out.append(f'        <g id="layer-{region}" opacity="{opac[region]}">')
        for layer in LAYERS_BY_REGION[region]:
            out.append('          ' + body(layer))
        out.append('        </g>')
    out.append('      </g>')
    return '\n'.join(out)


if __name__ == '__main__':
    tr, sc, h, c, b = sys.argv[1:6]
    gid = sys.argv[6] if len(sys.argv) > 6 else 'building'
    print(building(tr, sc, {'hat': h, 'coat': c, 'boots': b}, gid))

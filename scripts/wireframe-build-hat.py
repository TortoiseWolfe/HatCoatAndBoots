#!/usr/bin/env python3
"""Swap the Hat wireframe's <image href> building groups (desktop #building,
mobile #m-building) for the REAL inlined SVG bodies, so the building actually
paints in the /wireframes viewer and standalone."""
import re
import subprocess

WF = 'features/_uncategorized/048-hats-chapter/wireframes/02-book-hats-viewer.svg'


def gen(tr, sc, h, c, b, gid):
    r = subprocess.run(
        ['python3', 'scripts/wireframe-inline-building.py', tr, sc, h, c, b, gid],
        capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit('generator failed: ' + r.stderr)
    return r.stdout.rstrip('\n')


svg = open(WF).read()

desk = gen('360,20', '1.556', '1', '0.4', '0.4', 'building')
svg, n1 = re.subn(r'      <g id="building"[\s\S]*?\n      </g>', lambda m: desk, svg, count=1)

mob = gen('60,30', '0.667', '1', '0.4', '0.4', 'm-building')
svg, n2 = re.subn(r'      <g id="m-building"[\s\S]*?\n      </g>', lambda m: mob, svg, count=1)

open(WF, 'w').write(svg)
print(f'desktop swapped: {n1}, mobile swapped: {n2}')
print(f'remaining <image>: {svg.count("<image")}')

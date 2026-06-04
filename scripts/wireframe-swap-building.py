import re, sys
wf_path, block_path = sys.argv[1], sys.argv[2]
svg = open(wf_path).read()
block = open(block_path).read().rstrip('\n')
# Replace the DESKTOP <g id="building"...> ... </g> (the image-href one) with the inlined block.
# Match <g id="building" ...> up to its matching </g> (non-greedy, the building groups have no nested same-name).
pat = re.compile(r'      <g id="building"[\s\S]*?\n      </g>')
new, n = pat.subn(block, svg, count=1)
if n != 1:
    print(f"ERROR: expected 1 building group, replaced {n}", file=sys.stderr); sys.exit(1)
open(wf_path,'w').write(new)
print(f"  swapped building in {wf_path}")

# FastLane Digital Version Check

## Usage

The repository needs to be checked out on the runner with working git credentials (in order to make `git fetch --tags origin` work). Mostly using the [official checkout action](https://github.com/actions/checkout) works.

### Examples:

```yaml
uses: fast-lane-digital/version-check@0.1.0
with:
  version-format: "file"
```

```yaml
uses: fast-lane-digital/version-check@0.1.0
with:
  version-format: "node"
```

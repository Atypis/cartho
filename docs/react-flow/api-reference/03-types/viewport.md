# Viewport Type

**Source:** https://reactflow.dev/api-reference/types/viewport
**Scraped:** 2025-10-13T10:08:39.095Z

---

# Viewport

[Source on GitHub](https://github.com/xyflow/xyflow/blob/main/packages/system/src/types/general.ts/#L149-L153) 

Internally, React Flow maintains a coordinate system that is independent of the rest of the page. The `Viewport` type tells you where in that system your flow is currently being display at and how zoomed in or out it is.

## Fields[](#fields)

Name

Type

Default

[](#x)`x`

`number`

[](#y)`y`

`number`

[](#zoom)`zoom`

`number`

## Notes[](#notes)

*   A `Transform` has the same properties as the viewport, but they represent different things. Make sure you don’t get them muddled up or things will start to look weird!
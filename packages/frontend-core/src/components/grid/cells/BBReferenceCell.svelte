<script>
  import { getContext } from "svelte"
  import RelationshipCell from "./RelationshipCell.svelte"
  import { FieldSubtype } from "@budibase/types"

  const { API } = getContext("grid")
  const { subtype } = $$props.schema

  const schema = {
    ...$$props.schema,
    // This is not really used, just adding some content to be able to render the relationship cell
    tableId: "external",
  }

  async function searchFunction(searchParams) {
    if (subtype !== FieldSubtype.USER) {
      throw `Search for '${subtype}' not implemented`
    }

    const results = await API.searchUsers({
      ...searchParams,
    })

    // Mapping to the expected data within RelationshipCell
    return {
      ...results,
      data: undefined,
      rows: results.data,
    }
  }
</script>

<RelationshipCell
  {...$$props}
  {schema}
  {searchFunction}
  primaryDisplay={"email"}
/>

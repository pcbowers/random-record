import {
  initializeBlock,
  TablePickerSynced,
  ViewPickerSynced,
  FieldPickerSynced,
  useGlobalConfig,
  useBase,
  useRecordIds,
  useRecordById,
  Button,
  Heading,
  useSettingsButton,
  ColorPaletteSynced,
  colors,
  colorUtils,
  Text,
  SwitchSynced,
  RecordCard,
  expandRecord,
  Box,
  Link,
  useViewport
} from "@airtable/blocks/ui"
import React, { useEffect, useState } from "react"

function PrintRecord({ record, field, view, color, useCard }) {
  const hexColor = colorUtils.getHexForColor(color || colors.GRAY_DARK_1)
  let recordField = field?.id && record?.getCellValueAsString(field?.id)
  let recordName = field?.id && record?.name
  const viewport = useViewport()

  const openRecord = (e) => {
    e.preventDefault()
    expandRecord(record)
  }

  if (useCard && record)
    return <RecordCard record={record} width={viewport.size.width - 40} />

  if (!record && (!field || !view))
    return (
      <Heading
        textColor={hexColor}
        size="xxlarge"
        width="80%"
        overflowX="auto"
        marginBottom="-1"
        textAlign="center"
      >
        Set Settings First
      </Heading>
    )

  if (!record && field && view)
    return (
      <Heading
        textColor={hexColor}
        size="xxlarge"
        width="80%"
        overflowX="auto"
        marginBottom="-1"
        textAlign="center"
      >
        Record Doesn&apos;t Exist in View
      </Heading>
    )

  return (
    <>
      <Link
        href={record?.url}
        onClick={openRecord}
        target="_blank"
        width="80%"
        style={{ overflow: "auto" }}
      >
        <Heading
          textColor={hexColor}
          size="xxlarge"
          width="100%"
          maxHeight="40vh"
          marginBottom="1"
          textAlign="center"
          lineHeight="1.5"
        >
          {(record && field && recordField) || `No ${field.name}`}
        </Heading>
      </Link>
      {recordName !== recordField && (
        <>
          <Text
            textColor={hexColor}
            textAlign="center"
            marginBottom="1"
            variant="default"
          >
            From Record{" "}
            <Text
              as="span"
              textColor={hexColor}
              fontWeight="strong"
              variant="default"
            >
              {recordName}
            </Text>
          </Text>
        </>
      )}
    </>
  )
}

function Settings() {
  const base = useBase()
  const config = useGlobalConfig()
  const tableId = config.get("tableId") as string
  const useCard = config.get("useCard") as string
  const [table, setTable] = useState(base.getTableByIdIfExists(tableId))
  const allowedColors = Object.values(colors)

  useEffect(() => {
    setTable(base.getTableByIdIfExists(tableId))
  }, [tableId])

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        height="100vh"
        width="100vw"
        justifyContent="center"
        overflow="hidden"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          height="80%"
          width="90%"
          overflowX="hidden"
          overflowY="auto"
        >
          <TablePickerSynced
            globalConfigKey="tableId"
            size="large"
            width="95%"
            margin="1"
            disabled={!config.hasPermissionToSet("tableId")}
          />
          <ViewPickerSynced
            table={table}
            globalConfigKey="viewId"
            size="large"
            width="95%"
            margin="1"
            disabled={!config.hasPermissionToSet("viewId")}
          />
          {!useCard && (
            <FieldPickerSynced
              table={table}
              globalConfigKey="fieldId"
              size="large"
              width="95%"
              margin="1"
              disabled={!config.hasPermissionToSet("fieldId")}
            />
          )}
          <SwitchSynced
            globalConfigKey="useCard"
            label="Use a Record Card instead of a Field"
            size="large"
            width="95%"
            margin="1"
            disabled={!config.hasPermissionToSet("useCard")}
          />
          <ColorPaletteSynced
            globalConfigKey="color"
            allowedColors={allowedColors}
            width="95%"
            margin="1"
            style={{ overflow: "visible" }}
            disabled={!config.hasPermissionToSet("color")}
          />
        </Box>
      </Box>
    </>
  )
}

function Main() {
  const base = useBase()
  const config = useGlobalConfig()
  const tableId = config.get("tableId") as string
  const viewId = config.get("viewId") as string
  const fieldId = config.get("fieldId") as string
  const recordId = config.get("recordId") as string
  const color = config.get("color") as string
  const useCard = config.get("useCard") as string
  const [table, setTable] = useState(base.getTableByIdIfExists(tableId))
  const [view, setView] = useState(table?.getViewByIdIfExists(viewId))
  const [field, setField] = useState(table?.getFieldByIdIfExists(fieldId))
  const records = useRecordIds(view)
  const record = useRecordById(view, recordId || "")

  useEffect(() => {
    setTable(base.getTableByIdIfExists(tableId))
  }, [tableId])

  useEffect(() => {
    setView(table?.getViewByIdIfExists(viewId))
  }, [viewId])

  useEffect(() => {
    setField(table?.getFieldByIdIfExists(fieldId))
  }, [fieldId])

  useEffect(() => {
    if (recordId === "0") generateRandomValue()
  }, [recordId])

  useEffect(() => {
    if (
      (field && table && view && !recordId) ||
      (table && view && useCard && !recordId)
    )
      generateRandomValue()
  }, [field, table, view])

  const generateRandomValue = () => {
    config.setAsync(
      "recordId",
      records?.length && records[Math.floor(Math.random() * records.length)]
    )
  }

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        height="100vh"
        justifyContent="center"
      >
        <PrintRecord
          record={record}
          view={view}
          field={field}
          color={color}
          useCard={useCard}
        />
        {((useCard && tableId && viewId) || (tableId && viewId && fieldId)) &&
          config.hasPermissionToSet("randomId") && (
            <Button
              onClick={generateRandomValue}
              icon="redo"
              size={{
                xsmallViewport: "small",
                smallViewport: "large"
              }}
              marginTop="1em"
              disabled={!config.hasPermissionToSet("randomId")}
            >
              Choose Another Record
            </Button>
          )}
      </Box>
    </>
  )
}

function Component() {
  const [isShowingSettings, setIsShowingSettings] = useState(false)
  useSettingsButton(function () {
    setIsShowingSettings(!isShowingSettings)
  })
  if (isShowingSettings) {
    return <Settings />
  }
  return <Main />
}

initializeBlock(() => <Component />)

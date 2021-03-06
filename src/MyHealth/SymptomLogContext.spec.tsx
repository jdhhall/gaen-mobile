import React from "react"
import { Text, TouchableOpacity } from "react-native"
import { render, waitFor, fireEvent } from "@testing-library/react-native"

import { useSymptomLogContext, SymptomLogProvider } from "./SymptomLogContext"
import {
  getLogEntries,
  createLogEntry,
  deleteSymptomLogsOlderThan,
} from "./nativeModule"
import { Symptom } from "./symptoms"
import Logger from "../logger"

jest.mock("./nativeModule.ts")
jest.mock("./symptoms.ts")
jest.mock("../logger.ts")

describe("SymptomLogProvider", () => {
  describe("data creation", () => {
    it("allows for the creation of a new symptom log", async () => {
      const createLogEntrySpy = createLogEntry as jest.Mock
      createLogEntrySpy.mockResolvedValueOnce({})
      const mockedDate = Date.parse("2020-09-22 10:00")
      jest.spyOn(Date, "now").mockReturnValue(mockedDate)
      const symptoms: Symptom[] = ["cough"]
      const newLogEntry = {
        date: mockedDate,
        symptoms,
      }
      ;(getLogEntries as jest.Mock).mockResolvedValue([])

      const AddCheckLogSymptoms = () => {
        const { addLogEntry } = useSymptomLogContext()

        return (
          <>
            <TouchableOpacity
              accessibilityLabel="add-log-entry"
              onPress={() => {
                addLogEntry(symptoms)
              }}
            />
          </>
        )
      }

      const { getByLabelText } = render(
        <SymptomLogProvider>
          <AddCheckLogSymptoms />
        </SymptomLogProvider>,
      )

      fireEvent.press(getByLabelText("add-log-entry"))

      await waitFor(() => {
        expect(createLogEntrySpy).toHaveBeenCalledWith({ ...newLogEntry })
      })
    })

    it("captures exceptions and return failure responses", async () => {
      const errorMessage = "error"
      ;(createLogEntry as jest.Mock).mockRejectedValueOnce(
        new Error(errorMessage),
      )
      const resultSpy = jest.fn()
      const loggerSpy = jest.spyOn(Logger, "error")
      ;(getLogEntries as jest.Mock).mockResolvedValue([])

      const AddCheckInStatus = () => {
        const { addLogEntry } = useSymptomLogContext()

        return (
          <>
            <TouchableOpacity
              accessibilityLabel="add-log-entry"
              onPress={async () => {
                const result = await addLogEntry([])
                resultSpy(result)
              }}
            />
          </>
        )
      }

      const { getByLabelText } = render(
        <SymptomLogProvider>
          <AddCheckInStatus />
        </SymptomLogProvider>,
      )

      fireEvent.press(getByLabelText("add-log-entry"))

      await waitFor(() => {
        expect(resultSpy).toHaveBeenCalledWith({
          kind: "failure",
        })
        expect(loggerSpy).toHaveBeenCalledWith(errorMessage)
      })
    })
  })

  describe("data seeding", () => {
    it("fetchs all daily log entries", async () => {
      const logEntries = [{ date: Date.now(), symptoms: [], id: "1" }]
      ;(getLogEntries as jest.Mock).mockResolvedValueOnce(logEntries)

      render(
        <SymptomLogProvider>
          <SymptomLogConsumer />
        </SymptomLogProvider>,
      )

      await waitFor(() => {
        expect(getLogEntries).toHaveBeenCalled()
      })
    })

    it("deletes all the stale data on load", async () => {
      const deleteSymptomLogsOlderThanSpy = deleteSymptomLogsOlderThan as jest.Mock

      render(
        <SymptomLogProvider>
          <SymptomLogConsumer />
        </SymptomLogProvider>,
      )

      await waitFor(() => {
        expect(deleteSymptomLogsOlderThanSpy).toHaveBeenCalledWith(14)
      })
    })
  })
})

const SymptomLogConsumer = () => {
  const { symptomLogEntries } = useSymptomLogContext()

  return <Text testID="symptom-logs">{JSON.stringify(symptomLogEntries)}</Text>
}

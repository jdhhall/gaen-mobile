import { Factory } from "fishery"
import { SymptomLogState } from "../MyHealth/SymptomLogContext"

export default Factory.define<SymptomLogState>(() => ({
  symptomLogEntries: [],
  addLogEntry: jest.fn(),
  updateLogEntry: jest.fn(),
  deleteLogEntry: jest.fn(),
  deleteAllLogEntries: jest.fn(),
}))

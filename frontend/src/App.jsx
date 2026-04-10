import Layout from './components/layout/Layout'   // used for workspace
import UploadScreen from './components/upload/UploadScreen'
import WorkspaceLayout from './components/workspace/WorkspaceLayout'
import { useFileUpload } from './hooks/useFileUpload'
import { useAnalysis } from './hooks/useAnalysis'

export default function App() {
  const { file, error: fileError, handleFile, clearFile } = useFileUpload()
  const { result, loading, error: analysisError, analyze, reset } = useAnalysis()

  function handleReset() {
    reset()
    clearFile()
  }

  if (!file) {
    return <UploadScreen onFile={handleFile} error={fileError} />
  }

  return (
    <Layout fluid>
      <WorkspaceLayout
        file={file}
        result={result}
        loading={loading}
        error={analysisError}
        onAnalyze={analyze}
        onReset={handleReset}
      />
    </Layout>
  )
}

requireLogin();

function runCode() {
  const code = document.getElementById("codeArea").value;
  const output = document.getElementById("output");

  const previewResult = renderSafePreview(output, code);
  if (!previewResult.ok) {
    alert(previewResult.reason);
  }
}

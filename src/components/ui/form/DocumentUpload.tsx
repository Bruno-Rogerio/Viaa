// viaa\src\components\ui\form\DocumentUpload.tsx

"use client";
import { useState, useRef } from "react";
import type { TipoDocumento } from "../../../types/database";

interface DocumentoUpload {
  id: string;
  arquivo: File;
  tipo: TipoDocumento;
  descricao?: string;
  preview?: string;
}

interface DocumentUploadProps {
  documentos: DocumentoUpload[];
  onChange: (documentos: DocumentoUpload[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // em MB
  acceptedTypes?: string[];
}

const tiposDocumento: { value: TipoDocumento; label: string }[] = [
  { value: "diploma", label: "Diploma de Graduação" },
  { value: "pos_graduacao", label: "Pós-Graduação/Mestrado/Doutorado" },
  { value: "especializacao", label: "Certificado de Especialização" },
  { value: "registro_profissional", label: "Registro Profissional (CRP)" },
  { value: "certificado_curso", label: "Certificado de Curso" },
  { value: "comprovante_formacao", label: "Comprovante de Formação" },
  { value: "outros", label: "Outros" },
];

export default function DocumentUpload({
  documentos,
  onChange,
  maxFiles = 10,
  maxSizePerFile = 5, // 5MB
  acceptedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"],
}: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validarArquivo = (arquivo: File): string | null => {
    // Verificar tamanho
    if (arquivo.size > maxSizePerFile * 1024 * 1024) {
      return `Arquivo ${arquivo.name} excede o tamanho máximo de ${maxSizePerFile}MB`;
    }

    // Verificar tipo
    const extensao = `.${arquivo.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(extensao)) {
      return `Tipo de arquivo não suportado: ${extensao}`;
    }

    return null;
  };

  const adicionarDocumentos = async (arquivos: FileList) => {
    const novosErros: string[] = [];
    const novosDocumentos: DocumentoUpload[] = [];

    // Verificar limite de arquivos
    if (documentos.length + arquivos.length > maxFiles) {
      novosErros.push(`Máximo de ${maxFiles} arquivos permitidos`);
      setErrors(novosErros);
      return;
    }

    for (let i = 0; i < arquivos.length; i++) {
      const arquivo = arquivos[i];

      // Validar arquivo
      const erro = validarArquivo(arquivo);
      if (erro) {
        novosErros.push(erro);
        continue;
      }

      // Criar preview para imagens
      let preview: string | undefined;
      if (arquivo.type.startsWith("image/")) {
        preview = URL.createObjectURL(arquivo);
      }

      const novoDocumento: DocumentoUpload = {
        id: `${Date.now()}-${i}`,
        arquivo,
        tipo: "outros", // Padrão - usuário escolherá depois
        preview,
      };

      novosDocumentos.push(novoDocumento);
    }

    setErrors(novosErros);
    onChange([...documentos, ...novosDocumentos]);
  };

  const removerDocumento = (id: string) => {
    const documento = documentos.find((doc) => doc.id === id);
    if (documento?.preview) {
      URL.revokeObjectURL(documento.preview);
    }
    onChange(documentos.filter((doc) => doc.id !== id));
  };

  const atualizarDocumento = (
    id: string,
    campo: keyof DocumentoUpload,
    valor: any
  ) => {
    onChange(
      documentos.map((doc) =>
        doc.id === id ? { ...doc, [campo]: valor } : doc
      )
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      adicionarDocumentos(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      adicionarDocumentos(e.target.files);
      e.target.value = ""; // Reset input
    }
  };

  const formatarTamanho = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Adicionar Documentos
            </h3>
            <p className="text-gray-600 mb-4">
              Arraste e solte arquivos aqui ou clique para selecionar
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Selecionar Arquivos
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Tipos aceitos: {acceptedTypes.join(", ")} • Máximo{" "}
              {maxSizePerFile}MB por arquivo
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Exibir Erros */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h4 className="font-medium text-red-800 mb-2">Erros encontrados:</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {errors.map((erro, index) => (
              <li key={index}>• {erro}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de Documentos */}
      {documentos.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Documentos Adicionados ({documentos.length}/{maxFiles})
          </h3>

          <div className="grid gap-4">
            {documentos.map((documento) => (
              <div
                key={documento.id}
                className="bg-white border rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Preview ou Ícone */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {documento.preview ? (
                      <img
                        src={documento.preview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">📄</span>
                    )}
                  </div>

                  {/* Informações do Documento */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {documento.arquivo.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {formatarTamanho(documento.arquivo.size)}
                      </p>
                    </div>

                    {/* Tipo de Documento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Documento *
                      </label>
                      <select
                        value={documento.tipo}
                        onChange={(e) =>
                          atualizarDocumento(
                            documento.id,
                            "tipo",
                            e.target.value as TipoDocumento
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        {tiposDocumento.map((tipo) => (
                          <option key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Descrição Opcional */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição (opcional)
                      </label>
                      <input
                        type="text"
                        value={documento.descricao || ""}
                        onChange={(e) =>
                          atualizarDocumento(
                            documento.id,
                            "descricao",
                            e.target.value
                          )
                        }
                        placeholder="Ex: Diploma de Psicologia pela USP"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Botão Remover */}
                  <button
                    type="button"
                    onClick={() => removerDocumento(documento.id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover documento"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

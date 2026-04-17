{{/*
Expand the name of the chart.
*/}}
{{- define "guild-forge.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "guild-forge.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Chart label
*/}}
{{- define "guild-forge.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "guild-forge.labels" -}}
helm.sh/chart: {{ include "guild-forge.chart" . }}
{{ include "guild-forge.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "guild-forge.selectorLabels" -}}
app.kubernetes.io/name: {{ include "guild-forge.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Resolve image tag — uses per-service tag if set, falls back to global imageTag
*/}}
{{- define "guild-forge.imageTag" -}}
{{- .tag | default $.Values.imageTag | default "latest" }}
{{- end }}

{{/*
Resolve imagePullPolicy
*/}}
{{- define "guild-forge.pullPolicy" -}}
{{- .Values.imagePullPolicy | default "IfNotPresent" }}
{{- end }}

{{/*
PostgreSQL connection string
*/}}
{{- define "guild-forge.postgresUrl" -}}
{{- printf "postgresql://postgres:%s@%s-postgresql:5432/%s" .Values.postgresql.auth.postgresPassword (include "guild-forge.fullname" .) .Values.postgresql.auth.database }}
{{- end }}

{{/*
Internal service URLs
*/}}
{{- define "guild-forge.queueServiceUrl" -}}
{{- printf "http://%s-queue-service:8080" (include "guild-forge.fullname" .) }}
{{- end }}

{{- define "guild-forge.registryUrl" -}}
{{- printf "http://%s-registry:8080" (include "guild-forge.fullname" .) }}
{{- end }}

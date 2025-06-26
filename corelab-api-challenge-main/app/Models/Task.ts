import mongoose, { Document, Schema } from 'mongoose'

/**
 * Interface da Tarefa - Define a estrutura de uma tarefa
 */
export interface ITarefa extends Document {
  title: string
  description: string
  color: string
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

/**
 * Schema da Tarefa - Define a estrutura no MongoDB
 */
const esquemaTarefa: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [100, 'Título deve ter no máximo 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
  },
  color: {
    type: String,
    default: '#BAE2FF',
    validate: {
      validator: function(valor: string) {
        // Validar formato hexadecimal da cor
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(valor)
      },
      message: 'Cor deve estar no formato hexadecimal válido (ex: #BAE2FF)'
    }
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt automaticamente
  collection: 'tarefas' // Nome da coleção no MongoDB
})

/**
 * Índices para otimizar consultas
 */
esquemaTarefa.index({ title: 'text', description: 'text' }) // Busca textual
esquemaTarefa.index({ isFavorite: 1, createdAt: -1 }) // Ordenação por favoritos e data
esquemaTarefa.index({ color: 1 }) // Filtro por cor

/**
 * Métodos virtuais para formatação
 */
esquemaTarefa.virtual('resumo').get(function() {
  return this.description.length > 50 
    ? this.description.substring(0, 50) + '...'
    : this.description
})

/**
 * Método para converter para JSON
 */
esquemaTarefa.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v
    return ret
  }
})

/**
 * Middleware para validações pré-salvamento
 */
esquemaTarefa.pre('save', function(next) {
  // Limpar espaços em branco
  if (this.title) this.title = this.title.trim()
  if (this.description) this.description = this.description.trim()
  next()
})

/**
 * Métodos estáticos para consultas comuns
 */
esquemaTarefa.statics.buscarPorFiltros = function(filtros: any) {
  const consulta: any = {}
  
  // Filtro de busca textual
  if (filtros.search) {
    consulta.$text = { $search: filtros.search }
  }
  
  // Filtro de favoritos
  if (filtros.favorite !== undefined) {
    consulta.isFavorite = filtros.favorite === 'true'
  }
  
  // Filtro de cor
  if (filtros.color) {
    consulta.color = filtros.color
  }
  
  return this.find(consulta)
}

esquemaTarefa.statics.obterEstatisticas = async function() {
  const resultado = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        favoritas: { $sum: { $cond: ['$isFavorite', 1, 0] } },
        cores: { $addToSet: '$color' }
      }
    }
  ])
  
  return resultado[0] || { total: 0, favoritas: 0, cores: [] }
}

/**
 * Modelo da Tarefa - Exporta o modelo para uso em controllers
 */
const Tarefa = mongoose.model<ITarefa>('Tarefa', esquemaTarefa)

export default Tarefa

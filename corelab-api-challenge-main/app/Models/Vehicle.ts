import mongoose, { Schema, Document } from 'mongoose'

export interface IVehicleDocument extends Document {
  name: string
  description: string
  plate: string
  isFavorite: boolean
  year: number
  color: string
  price: number
  createdAt: Date
  updatedAt: Date
}

const VehicleSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  plate: {
    type: String,
    required: [true, 'Plate is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{3}-\d{4}$/, 'Plate must follow format ABC-1234']
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Year must be greater than 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.__v
      return ret
    }
  }
})

// Index for better performance
VehicleSchema.index({ isFavorite: -1, createdAt: -1 })
VehicleSchema.index({ name: 'text', description: 'text' })

export default mongoose.model<IVehicleDocument>('Vehicle', VehicleSchema)

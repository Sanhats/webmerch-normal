'use client'

import { useState } from "react"
import { Upload, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ImageUploadProps {
  value: {
    url: string
    color: {
      name: string
      hex: string
    }
  }[]
  onChange: (value: any[]) => void
  onRemove: (url: string) => void
}

export function ImageUpload({
  value = [],
  onChange,
  onRemove
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [imageError, setImageError] = useState<string[]>([])
  const supabase = createClientComponentClient()

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)

      const file = event.target.files?.[0]
      if (!file) return

      // Validar el tamaño del archivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('La imagen no debe superar los 5MB')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
      
      if (!fileExt || !allowedExtensions.includes(fileExt)) {
        throw new Error('Formato de archivo no soportado')
      }

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: `image/${fileExt}`
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      onChange([
        ...value,
        {
          url: publicUrl,
          color: {
            name: '',
            hex: '#000000'
          }
        }
      ])
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Error al subir la imagen')
    } finally {
      setLoading(false)
    }
  }

  const handleColorChange = (index: number, field: 'name' | 'hex', newValue: string) => {
    const newImages = [...value]
    newImages[index] = {
      ...newImages[index],
      color: {
        ...newImages[index].color,
        [field]: newValue
      }
    }
    onChange(newImages)
  }

  const handleImageError = (index: number) => {
    setImageError((prev) => [...prev, value[index].url])
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {value.map((image, index) => (
          <div key={image.url || index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {!imageError.includes(image.url) ? (
              <div className="relative w-full h-full">
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={`Product image ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  onError={() => handleImageError(index)}
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                Error al cargar la imagen
              </div>
            )}
            <button
              type="button"
              onClick={() => onRemove(image.url)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-2 right-2 space-y-2">
              <Input
                type="text"
                placeholder="Nombre del color"
                value={image.color.name || ''}
                onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                className="bg-white/90 text-sm"
              />
              <Input
                type="color"
                value={image.color.hex || '#000000'}
                onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                className="h-8 bg-white/90 p-1"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="secondary"
          disabled={loading}
          className="relative"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={onUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={loading}
          />
          <Upload className="h-4 w-4 mr-2" />
          {loading ? "Subiendo..." : "Subir Imagen"}
        </Button>
        <p className="text-sm text-gray-500">
          Formatos soportados: JPG, PNG, GIF, WEBP. Máximo 5MB.
        </p>
      </div>
    </div>
  )
}
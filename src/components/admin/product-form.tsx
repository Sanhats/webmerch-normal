'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "./image-upload"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Category {
  id: string
  name: string
}

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  price: z.string().min(1, "El precio es requerido"),
  stock: z.string().min(1, "El stock es requerido"),
  category_id: z.string().min(1, "La categoría es requerida"),
  featured: z.boolean().default(false),
  images: z.array(z.object({
    url: z.string(),
    color: z.object({
      name: z.string(),
      hex: z.string(),
    }),
  })).min(1, "Se requiere al menos una imagen"),
})
const defaultValues = {
  name: '',
  description: '',
  price: '',
  stock: '',
  category_id: '',
  featured: false,
  images: [] as {
    url: string;
    color: {
      name: string;
      hex: string;
    };
  }[]
}

export function ProductForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const supabase = createClientComponentClient()

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (!error && data) {
        setCategories(data)
      }
    }

    fetchCategories()
  }, [supabase])

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    try {
      setLoading(true)

      // Insertar producto
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: values.name,
          description: values.description,
          price: parseFloat(values.price),
          stock: parseInt(values.stock),
          category_id: values.category_id,
          featured: values.featured,
        })
        .select()
        .single()

      if (productError) throw productError

      // Insertar colores e imágenes
      for (const image of values.images) {
        // Insertar o obtener color
        const { data: color, error: colorError } = await supabase
          .from('colors')
          .insert({
            name: image.color.name,
            hex_value: image.color.hex,
          })
          .select()
          .single()

        if (colorError) throw colorError

        // Insertar imagen
        const { error: imageError } = await supabase
          .from('product_images')
          .insert({
            product_id: product.id,
            color_id: color.id,
            url: image.url,
          })

        if (imageError) throw imageError
      }

      router.push('/products')
      router.refresh()
    } catch (error) {
      console.error('Error al crear producto:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Nombre del producto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Descripción del producto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Destacado</FormLabel>
                <FormDescription>
                  Marca este producto como destacado para que aparezca en la página principal
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imágenes</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onRemove={(url) => {
                    field.onChange(field.value.filter((image) => image.url !== url))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Producto"}
        </Button>
      </form>
    </Form>
  )
}
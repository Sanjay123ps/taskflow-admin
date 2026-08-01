import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Camera, Loader2, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { initials } from '@/lib/utils'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const MAX_SIZE_BYTES = 5 * 1024 * 1024

export interface ProfilePhotoResult {
  profileImage: string | null
}

interface ProfilePhotoUploadProps {
  name: string
  imageUrl: string | null
  onUpload: (file: File) => Promise<ProfilePhotoResult>
  onRemove: () => Promise<ProfilePhotoResult>
  onChange: (result: ProfilePhotoResult) => void
}

/**
 * Self-contained profile photo widget: preview, upload, and remove, with
 * client-side type/size validation (the backend re-validates both — this
 * is just for a fast, friendly error before a request is even sent).
 * Deliberately takes onUpload/onRemove/onChange as props rather than
 * calling a specific API directly, so the same component can be dropped
 * into a future Staff profile page backed by a different auth context.
 */
export function ProfilePhotoUpload({ name, imageUrl, onUpload, onRemove, onChange }: ProfilePhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<'upload' | 'remove' | null>(null)

  const validate = (file: File): string | null => {
    if (!ALLOWED_TYPES.has(file.type)) {
      return 'Please upload a JPG, PNG, or WEBP image.'
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'Profile photo must be smaller than 5 MB.'
    }
    return null
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    const validationError = validate(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setBusy('upload')
    try {
      const result = await onUpload(file)
      onChange(result)
      toast.success('Profile photo updated')
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Profile photo upload failed. Please try again.', { description: apiError.message })
    } finally {
      setBusy(null)
    }
  }

  const handleRemove = async () => {
    setBusy('remove')
    try {
      const result = await onRemove()
      onChange(result)
      toast.success('Profile photo removed')
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not remove profile photo. Please try again.', { description: apiError.message })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="h-16 w-16">
          <AvatarImage src={imageUrl ?? undefined} alt={name} />
          <AvatarFallback className="text-base">{initials(name)}</AvatarFallback>
        </Avatar>
        {busy === 'upload' && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-ink-900/40">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-ink-900">Profile Photo</p>
        <p className="text-xs text-ink-400">JPG, PNG, or WEBP — up to 5MB.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy !== null}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-3.5 w-3.5" /> {imageUrl ? 'Replace Photo' : 'Upload Photo'}
          </Button>
          {imageUrl && (
            <Button type="button" variant="outlineDanger" size="sm" disabled={busy !== null} onClick={handleRemove}>
              <Trash2 className="h-3.5 w-3.5" /> {busy === 'remove' ? 'Removing…' : 'Remove Photo'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

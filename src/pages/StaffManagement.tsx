import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Plus, Pencil, KeyRound, UserX, UserCheck, MoreVertical, Users, Check, X as XIcon, UserPlus } from 'lucide-react'
import { useStaffList, useStaffMember, useDeactivateStaff, useReactivateStaff, useResetStaffPassword } from '@/hooks/useStaff'
import { useSignupRequests, useApproveSignupRequest, useRejectSignupRequest } from '@/hooks/useSignupRequests'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SearchInput } from '@/components/common/SearchInput'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/input'
import { TableSkeleton } from '@/components/common/TableSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { StaffFormDialog } from '@/components/staff/StaffFormDialog'
import { StaffDetailModal } from '@/components/dashboard/StaffDetailModal'
import { initials } from '@/lib/utils'
import type { StaffMember } from '@/types/user'
import type { SignupRequest } from '@/types/signupRequest'

export default function StaffManagement() {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [detailStaffId, setDetailStaffId] = useState<string | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<StaffMember | null>(null)
  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null)
  const [requestsPage, setRequestsPage] = useState(1)
  const [rejectTarget, setRejectTarget] = useState<SignupRequest | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const params = useMemo(
    () => ({ search: search || undefined, status, page, pageSize: 8 }),
    [search, status, page],
  )
  const { data, isLoading, isError, error, refetch } = useStaffList(params)
  const { data: detailStaff } = useStaffMember(detailStaffId)

  const deactivate = useDeactivateStaff()
  const reactivate = useReactivateStaff()
  const resetPassword = useResetStaffPassword()

  const requestsParams = useMemo(
    () => ({ status: 'PENDING' as const, page: requestsPage, pageSize: 8 }),
    [requestsPage],
  )
  const {
    data: requestsData,
    isLoading: requestsLoading,
    isError: requestsIsError,
    error: requestsError,
    refetch: refetchRequests,
  } = useSignupRequests(requestsParams)
  const approveRequest = useApproveSignupRequest()
  const rejectRequest = useRejectSignupRequest()
  const pendingCount = requestsData?.total ?? 0

  useEffect(() => {
    const openId = (location.state as { openStaffId?: string } | null)?.openStaffId
    if (openId) setDetailStaffId(openId)
  }, [location.state])

  useEffect(() => {
    setPage(1)
  }, [search, status])

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return
    try {
      if (deactivateTarget.status === 'ACTIVE') {
        await deactivate.mutateAsync(deactivateTarget.id)
        toast.success(`${deactivateTarget.name} has been deactivated`)
      } else {
        await reactivate.mutateAsync(deactivateTarget.id)
        toast.success(`${deactivateTarget.name} has been reactivated`)
      }
      setDeactivateTarget(null)
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Action failed', { description: apiError.message })
    }
  }

  const handleResetPassword = async () => {
    if (!resetTarget) return
    try {
      await resetPassword.mutateAsync(resetTarget.id)
      toast.success(`Password reset for ${resetTarget.name}`, { description: 'A temporary password has been emailed to them.' })
      setResetTarget(null)
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not reset password', { description: apiError.message })
    }
  }

  const handleApproveRequest = async (request: SignupRequest) => {
    try {
      await approveRequest.mutateAsync(request.id)
      toast.success(`${request.name} has been approved`, { description: 'They can now sign in to the staff app.' })
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not approve request', { description: apiError.message })
    }
  }

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return
    try {
      await rejectRequest.mutateAsync({ id: rejectTarget.id, reason: rejectReason.trim() || undefined })
      toast.success(`${rejectTarget.name}'s request has been rejected`)
      setRejectTarget(null)
      setRejectReason('')
    } catch (err) {
      const apiError = err as { message?: string }
      toast.error('Could not reject request', { description: apiError.message })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Staff Management</h1>
          <p className="mt-1 text-sm text-ink-500">Manage your team, their roles, and access.</p>
        </div>
        <Button
          onClick={() => {
            setEditingStaff(null)
            setFormOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> Add Staff
        </Button>
      </div>

      <Tabs defaultValue="staff">
        <TabsList>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1.5">
            Pending Requests
            {pendingCount > 0 && (
              <Badge variant="danger" className="ml-0.5 h-5 min-w-5 justify-center px-1">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="mt-4">
          <Card>
            <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row sm:items-center">
              <SearchInput value={search} onChange={setSearch} placeholder="Search by name or employee ID…" className="sm:max-w-xs" />
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <TableSkeleton rows={6} cols={6} />
            ) : isError ? (
              <ErrorState error={error} onRetry={refetch} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No staff members found"
                description={search || status !== 'ALL' ? 'Try adjusting your filters.' : 'Add your first staff member to get started.'}
                actionLabel={!search && status === 'ALL' ? 'Add Staff' : undefined}
                onAction={!search && status === 'ALL' ? () => setFormOpen(true) : undefined}
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((staff) => (
                      <TableRow key={staff.id} className="cursor-pointer" onClick={() => setDetailStaffId(staff.id)}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={staff.profileImage ?? undefined} alt={staff.name} />
                              <AvatarFallback className="text-[11px]">{initials(staff.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-ink-900">{staff.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{staff.employeeId}</TableCell>
                        <TableCell>{staff.email}</TableCell>
                        <TableCell>{staff.department}</TableCell>
                        <TableCell>
                          <Badge variant={staff.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                            {staff.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onSelect={() => {
                                  setEditingStaff(staff)
                                  setFormOpen(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => setResetTarget(staff)}>
                                <KeyRound className="h-4 w-4" /> Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem destructive={staff.status === 'ACTIVE'} onSelect={() => setDeactivateTarget(staff)}>
                                {staff.status === 'ACTIVE' ? (
                                  <>
                                    <UserX className="h-4 w-4" /> Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4" /> Reactivate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination page={page} totalPages={data.totalPages} totalItems={data.total} pageSize={data.pageSize} onPageChange={setPage} />
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <Card>
            {requestsLoading ? (
              <TableSkeleton rows={4} cols={4} />
            ) : requestsIsError ? (
              <ErrorState error={requestsError} onRetry={refetchRequests} />
            ) : !requestsData || requestsData.items.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No pending requests"
                description="New staff signup requests will show up here for review."
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestsData.items.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-[11px]">{initials(request.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-ink-900">{request.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>{request.phone || '—'}</TableCell>
                        <TableCell>{new Date(request.submittedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setRejectTarget(request)}
                              disabled={approveRequest.isPending || rejectRequest.isPending}
                            >
                              <XIcon className="h-4 w-4" /> Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApproveRequest(request)}
                              disabled={approveRequest.isPending || rejectRequest.isPending}
                            >
                              <Check className="h-4 w-4" /> Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination
                  page={requestsPage}
                  totalPages={requestsData.totalPages}
                  totalItems={requestsData.total}
                  pageSize={requestsData.pageSize}
                  onPageChange={setRequestsPage}
                />
              </>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <StaffFormDialog open={formOpen} onOpenChange={setFormOpen} staff={editingStaff} />

      <StaffDetailModal staff={detailStaff ?? null} onOpenChange={(open) => !open && setDetailStaffId(null)} />

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
        title={deactivateTarget?.status === 'ACTIVE' ? 'Deactivate staff member?' : 'Reactivate staff member?'}
        description={
          deactivateTarget?.status === 'ACTIVE'
            ? `${deactivateTarget?.name} will lose access to the staff app immediately. Their task history is kept.`
            : `${deactivateTarget?.name} will regain access to the staff app.`
        }
        confirmLabel={deactivateTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
        destructive={deactivateTarget?.status === 'ACTIVE'}
        isLoading={deactivate.isPending || reactivate.isPending}
        onConfirm={handleDeactivateConfirm}
      />

      <ConfirmDialog
        open={Boolean(resetTarget)}
        onOpenChange={(open) => !open && setResetTarget(null)}
        title="Reset password?"
        description={`A new temporary password will be generated and emailed to ${resetTarget?.name}.`}
        confirmLabel="Reset Password"
        isLoading={resetPassword.isPending}
        onConfirm={handleResetPassword}
      />

      <Dialog
        open={Boolean(rejectTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null)
            setRejectReason('')
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject signup request?</DialogTitle>
            <DialogDescription>
              {rejectTarget?.name} will be notified that their request was not approved. You can optionally add a
              reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason (optional)…"
            rows={3}
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRejectTarget(null)} disabled={rejectRequest.isPending}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRejectConfirm} disabled={rejectRequest.isPending}>
              {rejectRequest.isPending ? 'Please wait…' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

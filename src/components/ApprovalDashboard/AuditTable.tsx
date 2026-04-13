import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const AuditTable = ({ data, onResolve, onReject, onViewDetails }) => {
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved':
      case 'success':
        return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Resolved</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20">Rejected</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-400 border-slate-500/20">{status}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-hidden p-4"> {/* Tambah padding luar agar tidak mentok */}
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-slate-400 font-bold px-6 py-4">LOG ID</TableHead>
            <TableHead className="text-slate-400 font-bold px-4">ACTION</TableHead>
            <TableHead className="text-slate-400 font-bold px-4">USER</TableHead>
            <TableHead className="text-slate-400 font-bold px-4">STATUS</TableHead>
            <TableHead className="text-slate-400 font-bold px-6 text-right">DETAILS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((log) => (
              <TableRow key={log.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group">
                <TableCell className="font-mono text-indigo-400 font-medium px-6 py-4">#{log.id}</TableCell>
                <TableCell className="px-4 text-slate-200">{log.action}</TableCell>
                <TableCell className="px-4 text-slate-400 text-sm">{log.user}</TableCell>
                <TableCell className="px-4">{getStatusBadge(log.status)}</TableCell>
                <TableCell className="px-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {log.status === "Pending" && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => onReject(log.id)} className="text-rose-500"><XCircle size={18} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => onResolve(log.id)} className="text-emerald-500"><CheckCircle2 size={18} /></Button>
                      </>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-slate-400 hover:text-white"
                      onClick={() => onViewDetails(log)}
                    >
                      <Eye size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow><TableCell colSpan={5} className="h-32 text-center text-slate-500">No logs found.</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuditTable;
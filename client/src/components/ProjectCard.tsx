// import React from "react";

// interface ProjectCardProps {
//   workspaceId: string;
//   project: {
//     id: string;
//     name: string;
//     status: string;
//     description: string;
//     completedCount: number;
//   };
// }

// function ProjectCard() {
//   return (
//     <Link key={project.id} to={`/w/${workspaceId}/projects/${project.id}`}>
//       <Card className="h-full hover:border-primary/50 transition-colors">
//         <CardHeader>
//           <div className="flex items-start justify-between">
//             <CardTitle className="text-base">{project.name}</CardTitle>
//             <Badge className={statusStyles[project.status]} variant="secondary">
//               {project.status}
//             </Badge>
//           </div>
//         </CardHeader>
//         <CardContent className="flex flex-col gap-4">
//           <p className="text-sm text-muted-foreground line-clamp-2">
//             {project.description}
//           </p>

//           <div className="flex flex-col gap-1.5">
//             <div className="flex items-center justify-between text-xs text-muted-foreground">
//               <span className="flex items-center gap-1">
//                 <CheckSquare className="h-3.5 w-3.5" />
//                 {project.completedCount}/{project.taskCount} tasks
//               </span>
//               <span>{progress}%</span>
//             </div>
//             <Progress value={progress} />
//           </div>

//           <div className="flex -space-x-2">
//             {project.members.map((member) => (
//               <Avatar
//                 key={member.id}
//                 className="h-6 w-6 border-2 border-background"
//               >
//                 <AvatarFallback className="text-[10px]">
//                   {member.name.slice(0, 2).toUpperCase()}
//                 </AvatarFallback>
//               </Avatar>
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     </Link>
//   );
// }

// export default ProjectCard;


export async function GET
    (
        request: Request,
        {params}:{params :Promise <{classroomid :string}>}

    ) { 
        const resolvedParams =await params;
    const { classroomid } = resolvedParams;
    return Response.json({ id: classroomid });
}

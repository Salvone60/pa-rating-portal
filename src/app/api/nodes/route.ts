import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const nodes = await prisma.pANode.findMany({
      include: {
        children: true,
        reviews: { select: { rating: true } },
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(nodes);
  } catch (error) {
    console.error('API Nodes GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, parentId } = body;

    let level = 1;
    if (parentId) {
      const parentNode = await prisma.pANode.findUnique({ where: { id: parentId } });
      if (!parentNode) {
        return NextResponse.json({ error: 'Parent node not found' }, { status: 404 });
      }
      if (parentNode.level >= 5) {
        return NextResponse.json({ error: 'Maximum depth of 5 levels reached' }, { status: 400 });
      }
      level = parentNode.level + 1;
    }

    const newNode = await prisma.pANode.create({
      data: {
        name,
        description,
        level,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(newNode, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create node' }, { status: 500 });
  }
}

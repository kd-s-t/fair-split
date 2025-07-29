'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const Logo3D = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    const width = containerRef.current.clientWidth
    const height = containerRef.current.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#111')

    const camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000)
    camera.position.set(0, 0, 150)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    containerRef.current.appendChild(renderer.domElement)

    const light = new THREE.DirectionalLight(0xffffff, 1)
    light.position.set(1, 1, 1)
    scene.add(light)

    const ambient = new THREE.AmbientLight(0x404040)
    scene.add(ambient)

    const controls = new OrbitControls(camera, renderer.domElement)

    const loader = new SVGLoader()
    loader.load('/safesplit.svg', (data) => {
      const paths = data.paths; // Use all paths for the full logo

      paths.forEach((path) => {
        const shapes = SVGLoader.createShapes(path)

        shapes.forEach((shape) => {
          const geometry = new THREE.ExtrudeGeometry(shape, {
            depth: 10,
            bevelEnabled: false,
          })

          geometry.computeBoundingBox()
          const center = new THREE.Vector3()
          geometry.boundingBox.getCenter(center)
          geometry.translate(-center.x, -center.y, 0)

          // Use path color if available, otherwise fallback to white
          const material = new THREE.MeshStandardMaterial({
            color: path.color ? new THREE.Color(path.color) : 0xffffff,
            metalness: 0.3,
            roughness: 0.4,
          })

          const mesh = new THREE.Mesh(geometry, material)
          mesh.scale.set(2, -2, 2) // Enlarge and flip vertically
          scene.add(mesh)
        })
      })
    })

    const handleResize = () => {
      const newWidth = containerRef.current.clientWidth
      const newHeight = containerRef.current.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}

export default Logo3D

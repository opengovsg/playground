/**
 * Computes the N-th Fibonacci number
 * @param N The N-th number 1-indexed
 */
export async function fibonacci(N: number): Promise<number> {
    return new Promise((resolve, reject) => {
        if (!Number.isInteger(N)) return reject('Value is not an integer')
        if (N <= 0) return reject('Value is less than or equal to zero')
        if (N === 1) return resolve(0)
        if (N === 2) return resolve(1)

        setTimeout(() => {
            let [a, b, c] = [0, 1, 1]

            for (let i = 3; i <= N; i++) {
                c = a + b
                a = b
                b = c
            }
            return resolve(c)
        }, 5000 + Math.random() * 5000) // Between 5-10s
    })

}
